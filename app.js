// Inject only the public Supabase project URL and publishable/anon key at hosting time.
// Never place a service-role key or JWT signing secret in this browser configuration.
const MSTK_CONFIG = window.MSTK_CONFIG || {};
let mstkSession = null;
let selectedWorkspace = null;
let selectedConversation = null;

function show(id){
  document.querySelectorAll('.page').forEach(page=>page.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function setStatus(message, kind=''){
  const el=document.getElementById('account-status');
  el.textContent=message;
  el.className='status'+(kind?' '+kind:'');
}
function setSignedIn(signedIn){
  document.getElementById('signin-button').classList.toggle('hidden',signedIn);
  document.getElementById('signup-button').classList.toggle('hidden',signedIn);
  document.getElementById('signout-button').classList.toggle('hidden',!signedIn);
  document.getElementById('verify-button').disabled=!signedIn;
  document.getElementById('account-heading').textContent=signedIn?'Signed in':'Sign in or create an account';
}
function authConfig(){
  if(typeof MSTK_CONFIG.supabaseUrl!=='string'||typeof MSTK_CONFIG.supabaseAnonKey!=='string')return null;
  try{
    const url=new URL(MSTK_CONFIG.supabaseUrl);
    if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)return null;
    if(!MSTK_CONFIG.supabaseAnonKey.trim())return null;
    let apiBase='';
    if(typeof MSTK_CONFIG.apiBase==='string'&&MSTK_CONFIG.apiBase.trim()){const apiUrl=new URL(MSTK_CONFIG.apiBase);if(apiUrl.protocol!=='https:'||apiUrl.username||apiUrl.password||apiUrl.search||apiUrl.hash)return null;apiBase=apiUrl.toString().replace(/\/$/,'');}
    return {base:url.toString().replace(/\/$/,''),key:MSTK_CONFIG.supabaseAnonKey,apiBase};
  }catch{return null;}
}
let mstkRefreshPromise=null;
async function refreshSessionIfNeeded(){
  if(mstkRefreshPromise)return mstkRefreshPromise;
  const sessionAtStart=mstkSession;
  if(!sessionAtStart?.access_token)return null;
  const expiresAt=Number(sessionAtStart._mstkExpiresAt||0);
  if(!expiresAt||expiresAt>Date.now()+60000)return sessionAtStart;
  mstkRefreshPromise=(async()=>{
    if(typeof sessionAtStart.refresh_token!=='string'||!sessionAtStart.refresh_token){
      if(mstkSession===sessionAtStart){mstkSession=null;setSignedIn(false);resetWorkspacePanels();}
      throw new Error('Your sign-in session expired. Please sign in again.');
    }
    let refreshed;
    try{refreshed=await authRequest('token?grant_type=refresh_token',{refresh_token:sessionAtStart.refresh_token});}
    catch{
      if(mstkSession===sessionAtStart){mstkSession=null;setSignedIn(false);resetWorkspacePanels();}
      throw new Error('Your sign-in session could not be refreshed. Please sign in again.');
    }
    if(mstkSession!==sessionAtStart)return null;
    if(!refreshed?.access_token){
      mstkSession=null;setSignedIn(false);resetWorkspacePanels();
      throw new Error('Your sign-in session could not be refreshed. Please sign in again.');
    }
    refreshed._mstkExpiresAt=Date.now()+Math.max(0,Number(refreshed.expires_in)||3600)*1000;
    mstkSession=refreshed;
    return mstkSession;
  })();
  try{return await mstkRefreshPromise;}
  finally{mstkRefreshPromise=null;}
}
function trackSessionExpiry(session){
  if(session&&Number.isFinite(Number(session.expires_in))){
    session._mstkExpiresAt=Date.now()+Math.max(0,Number(session.expires_in))*1000;
  }
  return session;
}
async function authRequest(path,body,token){
  const config=authConfig();
  if(!config)throw new Error('Authentication is not configured. The site owner must set the public Supabase URL and publishable/anon key.');
  const headers={'content-type':'application/json','apikey':config.key};
  if(token)headers.authorization='Bearer '+token;
  const response=await fetch(config.base+'/auth/v1/'+path,{method:'POST',headers,body:JSON.stringify(body),redirect:'error'});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(typeof data.msg==='string'?data.msg:typeof data.message==='string'?data.message:'Authentication request failed.');
  return data;
}
async function authenticate(mode){
  const email=document.getElementById('account-email').value.trim();
  const password=document.getElementById('account-password').value;
  if(!email||!password){setStatus('Enter your email and password.','error');return;}
  if(password.length<8||password.length>128){setStatus('Password must be between 8 and 128 characters.','error');return;}
  const buttons=['signin-button','signup-button'];
  buttons.forEach(id=>document.getElementById(id).disabled=true);
  try{
    if(mode==='signup'){
      const data=await authRequest('signup',{email,password});
      if(data.access_token){
        mstkSession=trackSessionExpiry(data);
        setSignedIn(true);
        setStatus('Account created and signed in.','good');
        loadWorkspaces();
      }else{
        setStatus('Sign-up request received. Check your email for the confirmation step. No session has been created yet.','good');
      }
    }else{
      mstkSession=trackSessionExpiry(await authRequest('token?grant_type=password',{email,password}));
      setSignedIn(true);
      setStatus('Signed in for this page session.','good');
      loadWorkspaces();
    }
    document.getElementById('account-password').value='';
  }catch(error){
    mstkSession=null;
    setSignedIn(false);
    setStatus(error.message||'Unable to complete authentication.','error');
  }finally{
    buttons.forEach(id=>document.getElementById(id).disabled=false);
  }
}
async function recoverAccount(){
  const email=document.getElementById('account-email').value.trim();
  if(!email){setStatus('Enter your account email first.','error');return;}
  const button=document.getElementById('recover-button');button.disabled=true;
  try{
    const redirectTo=location.origin+location.pathname;
    await authRequest('recover?redirect_to='+encodeURIComponent(redirectTo),{email});
    setStatus('If an account exists for that address, a password-recovery email will be sent. Check your inbox and spam folder.','good');
  }catch(error){
    setStatus(error.message||'Unable to request password recovery.','error');
  }finally{button.disabled=false;}
}
async function completePasswordRecovery(){
  const password=document.getElementById('recovery-password').value;
  if(password.length<8||password.length>128){setStatus('New password must be between 8 and 128 characters.','error');return;}
  if(!mstkSession?.access_token){setStatus('The recovery link is missing or expired. Request a new password-recovery email.','error');return;}
  const button=document.getElementById('reset-password-button');button.disabled=true;
  try{
    const config=authConfig();
    const response=await fetch(config.base+'/auth/v1/user',{method:'PUT',headers:{apikey:config.key,authorization:'Bearer '+mstkSession.access_token,'content-type':'application/json'},body:JSON.stringify({password}),redirect:'error'});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(typeof data.msg==='string'?data.msg:typeof data.message==='string'?data.message:'Password could not be updated.');
    mstkSession=null;setSignedIn(false);resetWorkspacePanels();
    document.getElementById('password-recovery-panel').classList.add('hidden');
    document.getElementById('recovery-password').value='';
    setStatus('Password updated. Sign in with your new password.','good');
  }catch(error){setStatus(error.message||'Unable to update password.','error');}
  finally{button.disabled=false;}
}
function handlePasswordRecoveryCallback(){
  const params=new URLSearchParams(location.hash.replace(/^#/,''));
  const accessToken=params.get('access_token');
  const refreshToken=params.get('refresh_token');
  const type=params.get('type');
  if(type==='recovery'){
    history.replaceState(null,'',location.pathname+location.search);
    if(accessToken&&refreshToken){
      mstkSession=trackSessionExpiry({access_token:accessToken,refresh_token:refreshToken,expires_in:Number(params.get('expires_in'))||3600,token_type:params.get('token_type')||'bearer'});
      setSignedIn(true);
      document.getElementById('password-recovery-panel').classList.remove('hidden');
      setStatus('Recovery link verified. Choose a new password below.','good');
    }else{
      setStatus('The recovery link is incomplete or expired. Request a new one.','error');
    }
  }
}
async function verifySession(){
  if(!mstkSession?.access_token)return;
  const config=authConfig();
  try{
    await refreshSessionIfNeeded();
    if(!config.apiBase)throw new Error('MSTK API base URL is not configured; Supabase sign-in may work, but API session verification is unavailable.');
    const response=await fetch(new URL('/api/me',config.apiBase).toString(),{headers:{authorization:'Bearer '+mstkSession.access_token},redirect:'error'});
    if(!response.ok)throw new Error('MSTK API verification failed (HTTP '+response.status+').');
    const data=await response.json();
    setStatus('MSTK API verified this session. User ID: '+data.user.id,'good');
  }catch(error){
    setStatus(error.message||'API verification is not available.','error');
  }
}
async function signOut(){
  const sessionAtSignOut=mstkSession;
  const config=authConfig();
  try{
    if(sessionAtSignOut?.access_token&&config){
      await fetch(config.base+'/auth/v1/logout',{method:'POST',headers:{apikey:config.key,authorization:'Bearer '+sessionAtSignOut.access_token},redirect:'error'});
    }
  }catch{}
  mstkSession=null;
  setSignedIn(false);
  document.getElementById('workspace-list')?.replaceChildren();
  setWorkspaceStatus('Sign in to load your workspaces.');
  selectedWorkspace=null;selectedConversation=null;resetWorkspacePanels();
  setStatus('Signed out of this page session.','good');
}


let blindComparison = null;
function startBlindComparison(){
  const sourceA=document.getElementById('compare-source-a').value.trim()||'Source A';
  const sourceB=document.getElementById('compare-source-b').value.trim()||'Source B';
  const answerA=document.getElementById('compare-answer-a').value.trim();
  const answerB=document.getElementById('compare-answer-b').value.trim();
  const status=document.getElementById('comparison-status');
  if(!answerA||!answerB){status.textContent='Paste both responses before starting.';status.className='status error';return;}
  if(sourceA===sourceB){status.textContent='Use two different source labels.';status.className='status error';return;}
  const swapped=Math.random()<0.5;
  blindComparison={items:swapped?[{source:sourceB,text:answerB},{source:sourceA,text:answerA}]:[{source:sourceA,text:answerA},{source:sourceB,text:answerB}],choice:null,revealed:false};
  document.getElementById('blind-label-one').textContent='A';
  document.getElementById('blind-label-two').textContent='B';
  document.getElementById('blind-text-one').textContent=blindComparison.items[0].text;
  document.getElementById('blind-text-two').textContent=blindComparison.items[1].text;
  document.getElementById('comparison-stage').hidden=false;
  document.getElementById('best-result').hidden=true;
  document.getElementById('best-result-source').textContent='';
  document.getElementById('best-result-text').textContent='';
  document.getElementById('reveal-comparison-button').disabled=true;
  status.textContent='Sources are hidden. Choose the response you prefer.';
  status.className='status';
}
function chooseBlindResponse(index){
  if(!blindComparison||blindComparison.revealed||![0,1].includes(index))return;
  blindComparison.choice=index;
  document.getElementById('comparison-status').textContent='You selected response '+(index===0?'A':'B')+'. You can now reveal the sources.';
  document.getElementById('reveal-comparison-button').disabled=false;
}
function revealBlindComparison(){
  if(!blindComparison||blindComparison.choice===null)return;
  blindComparison.revealed=true;
  const selected=blindComparison.items[blindComparison.choice];
  document.getElementById('comparison-status').textContent='Your choice: '+(blindComparison.choice===0?'A':'B')+' · Source: '+selected.source+'. A: '+blindComparison.items[0].source+' · B: '+blindComparison.items[1].source+'.';
  document.getElementById('best-result-source').textContent='Winning source: '+selected.source;
  document.getElementById('best-result-text').textContent=selected.text;
  document.getElementById('best-result').hidden=false;
  document.getElementById('reveal-comparison-button').disabled=true;
}
function setWorkspaceStatus(message,kind=''){
  const el=document.getElementById('workspace-status');
  if(!el)return;
  el.textContent=message;
  el.className='status'+(kind?' '+kind:'');
}
async function workspaceRequest(path,method='GET',body){
  const config=authConfig();
  if(!config||!mstkSession?.access_token)throw new Error('Sign in and configure Supabase before accessing workspace data.');
  await refreshSessionIfNeeded();
  const headers={apikey:config.key,authorization:'Bearer '+mstkSession.access_token,accept:'application/json'};
  const options={method,headers,redirect:'error'};
  if(body!==undefined){headers['content-type']='application/json';headers.prefer='return=representation';options.body=JSON.stringify(body);}
  const response=await fetch(config.base+'/rest/v1/'+path,options);
  const data=await response.json().catch(()=>null);
  if(!response.ok){
    if(response.status===404||data?.code==='42P01')throw new Error('Workspace database tables are not available yet. The project owner must apply the reviewed Supabase migrations first.');
    if(response.status===401||response.status===403)throw new Error('Workspace access was denied. Check your session and database row-level security policies.');
    throw new Error('Workspace database request failed (HTTP '+response.status+').');
  }
  return data;
}
async function loadWorkspaces(){
  const list=document.getElementById('workspace-list');
  if(!list)return;
  if(!mstkSession?.access_token){list.replaceChildren();setWorkspaceStatus('Sign in to load your workspaces.');return;}
  const button=document.getElementById('refresh-workspaces-button');
  button.disabled=true;setWorkspaceStatus('Loading your workspaces…');
  try{
    const rows=await workspaceRequest('workspaces?select=id,name,created_at&order=created_at.desc');
    list.replaceChildren();
    for(const workspace of Array.isArray(rows)?rows:[]){
      const card=document.createElement('article');card.className='workspace-item'+(selectedWorkspace?.id===workspace.id?' selected':'');
      const name=document.createElement('strong');name.textContent=workspace.name;
      const id=document.createElement('span');id.textContent='Workspace ID: '+workspace.id;
      const select=document.createElement('button');select.className='action secondary';select.textContent=selectedWorkspace?.id===workspace.id?'Selected':'Open workspace';
      select.addEventListener('click',()=>selectWorkspace(workspace));
      card.append(name,id,select);list.append(card);
    }
    setWorkspaceStatus(rows.length?('Loaded '+rows.length+' workspace(s).'):'No workspaces yet. Create your first one.','good');
    if(selectedWorkspace&&!rows.some(w=>w.id===selectedWorkspace.id)){selectedWorkspace=null;selectedConversation=null;resetWorkspacePanels();}
    if(selectedWorkspace)await selectWorkspace(selectedWorkspace);
  }catch(error){list.replaceChildren();setWorkspaceStatus(error.message||'Unable to load workspaces.','error');}
  finally{button.disabled=false;}
}
function resetWorkspacePanels(){
  document.getElementById('selected-workspace-title').textContent='Select a workspace to manage projects';
  document.getElementById('project-list').replaceChildren();
  document.getElementById('conversation-list').replaceChildren();
  document.getElementById('message-history').replaceChildren();
  document.getElementById('project-name').disabled=true;
  document.getElementById('create-project-button').disabled=true;
  document.getElementById('conversation-title').disabled=true;
  document.getElementById('create-conversation-button').disabled=true;
  document.getElementById('prompt').disabled=true;
  document.getElementById('send-prompt-button').disabled=true;
  document.getElementById('history-status').textContent='Select a workspace first.';
}
async function selectWorkspace(workspace){
  selectedWorkspace=workspace;selectedConversation=null;
  document.getElementById('selected-workspace-title').textContent='Workspace: '+workspace.name;
  document.getElementById('project-name').disabled=false;
  document.getElementById('create-project-button').disabled=false;
  document.getElementById('conversation-title').disabled=false;
  document.getElementById('create-conversation-button').disabled=false;
  document.getElementById('prompt').disabled=true;
  document.getElementById('send-prompt-button').disabled=true;
  await Promise.all([loadProjects(),loadConversations()]);
  document.querySelectorAll('#workspace-list .workspace-item').forEach(card=>card.classList.toggle('selected',card.querySelector('span')?.textContent==='Workspace ID: '+workspace.id));
}
async function loadProjects(){
  if(!selectedWorkspace)return;
  const list=document.getElementById('project-list');list.replaceChildren();
  try{
    const rows=await workspaceRequest('projects?select=id,name,description,created_at&workspace_id=eq.'+encodeURIComponent(selectedWorkspace.id)+'&order=created_at.desc');
    for(const project of rows||[]){
      const card=document.createElement('article');card.className='workspace-item';
      const name=document.createElement('strong');name.textContent=project.name;
      const desc=document.createElement('span');desc.textContent=project.description||'Project';
      card.append(name,desc);list.append(card);
    }
  }catch(error){setWorkspaceStatus(error.message||'Unable to load projects.','error');}
}
async function createProject(){
  const input=document.getElementById('project-name'),button=document.getElementById('create-project-button');
  const name=input.value.trim();
  if(!selectedWorkspace||!name||name.length>120){setWorkspaceStatus('Select a workspace and enter a project name up to 120 characters.','error');return;}
  button.disabled=true;
  try{
    await workspaceRequest('projects','POST',{workspace_id:selectedWorkspace.id,created_by:mstkSession.user.id,name});
    input.value='';await loadProjects();setWorkspaceStatus('Project created.','good');
  }catch(error){setWorkspaceStatus(error.message||'Unable to create project.','error');}
  finally{button.disabled=false;}
}
async function loadConversations(){
  if(!selectedWorkspace)return;
  const list=document.getElementById('conversation-list');list.replaceChildren();
  try{
    const rows=await workspaceRequest('conversations?select=id,title,created_at&workspace_id=eq.'+encodeURIComponent(selectedWorkspace.id)+'&order=created_at.desc');
    for(const conversation of rows||[]){
      const card=document.createElement('article');card.className='workspace-item'+(selectedConversation?.id===conversation.id?' selected':'');
      const title=document.createElement('strong');title.textContent=conversation.title;
      const open=document.createElement('button');open.className='action secondary';open.textContent=selectedConversation?.id===conversation.id?'Open':'Open conversation';
      open.addEventListener('click',()=>selectConversation(conversation));
      card.append(title,open);list.append(card);
    }
  }catch(error){setWorkspaceStatus(error.message||'Unable to load conversations.','error');}
}
async function createConversation(){
  const input=document.getElementById('conversation-title'),button=document.getElementById('create-conversation-button');
  const title=input.value.trim()||'New chat';
  if(!selectedWorkspace||title.length>200){setWorkspaceStatus('Select a workspace and use a title up to 200 characters.','error');return;}
  button.disabled=true;
  try{
    const rows=await workspaceRequest('conversations','POST',{workspace_id:selectedWorkspace.id,created_by:mstkSession.user.id,title});
    input.value='';
    if(Array.isArray(rows)&&rows[0])await selectConversation(rows[0]);
    await loadConversations();setWorkspaceStatus('Conversation created.','good');
  }catch(error){setWorkspaceStatus(error.message||'Unable to create conversation.','error');}
  finally{button.disabled=false;}
}
async function selectConversation(conversation){
  selectedConversation=conversation;
  document.getElementById('prompt').disabled=false;
  document.getElementById('send-prompt-button').disabled=false;
  document.getElementById('history-status').textContent='Loading message history…';
  await loadMessages();
  await loadConversations();
}
async function loadMessages(){
  if(!selectedConversation||!selectedWorkspace)return;
  const list=document.getElementById('message-history');list.replaceChildren();
  try{
    const rows=await workspaceRequest('messages?select=id,role,content,created_at&conversation_id=eq.'+encodeURIComponent(selectedConversation.id)+'&workspace_id=eq.'+encodeURIComponent(selectedWorkspace.id)+'&order=created_at.asc');
    for(const message of rows||[]){
      const card=document.createElement('article');card.className='message-item';
      const role=document.createElement('strong');role.textContent=message.role==='user'?'You':message.role;
      const content=document.createElement('p');content.textContent=message.content;
      card.append(role,content);list.append(card);
    }
    document.getElementById('history-status').textContent=(rows||[]).length+' saved message(s).';
  }catch(error){document.getElementById('history-status').textContent=error.message||'Unable to load message history.';}
}
async function createWorkspace(){
  const input=document.getElementById('workspace-name'),button=document.getElementById('create-workspace-button'),name=input.value.trim();
  if(!name||name.length>100){setWorkspaceStatus('Enter a workspace name between 1 and 100 characters.','error');return;}
  if(!mstkSession?.access_token||!mstkSession?.user?.id){setWorkspaceStatus('Sign in before creating a workspace.','error');return;}
  button.disabled=true;
  try{await workspaceRequest('workspaces','POST',{name,owner_id:mstkSession.user.id});input.value='';setWorkspaceStatus('Workspace created.','good');await loadWorkspaces();}
  catch(error){setWorkspaceStatus(error.message||'Unable to create workspace.','error');}
  finally{button.disabled=false;}
}
async function sendPrompt(){
  const value=document.getElementById('prompt').value.trim();
  if(!value)return;
  if(!selectedWorkspace||!selectedConversation){setWorkspaceStatus('Select a workspace and conversation before sending a message.','error');return;}
  const sendButton=document.getElementById('send-prompt-button');sendButton.disabled=true;
  try{
    await workspaceRequest('messages','POST',{conversation_id:selectedConversation.id,workspace_id:selectedWorkspace.id,created_by:mstkSession.user.id,role:'user',content:value});
    document.getElementById('prompt').value='';
    await loadMessages();
  }catch(error){document.getElementById('response').textContent=error.message||'Unable to save message.';sendButton.disabled=false;return;}

  const response=document.getElementById('response');
  response.replaceChildren();
  const panel=document.createElement('div');panel.className='panel';
  const note=document.createElement('p');note.className='note';
  note.textContent='Connecting to MSTK AI…';
  panel.append(note);response.append(panel);
  const config=authConfig();
  if(!mstkSession?.access_token||!config?.apiBase){
    note.textContent='Your message is saved. Configure the MSTK API URL to enable AI replies.';
    sendButton.disabled=false;
    return;
  }
  try{
    const endpoint=new URL('/api/ai/chat',config.apiBase);
    const result=await fetch(endpoint.toString(),{
      method:'POST',
      headers:{'content-type':'application/json',authorization:'Bearer '+mstkSession.access_token},
      body:JSON.stringify({prompt:value}),
      redirect:'error'
    });
    const data=await result.json().catch(()=>({}));
    if(!result.ok)throw new Error(data.error==='ai_provider_not_enabled'?'AI provider is not enabled yet.':data.error==='ai_provider_not_configured'?'AI provider configuration is incomplete.':'MSTK AI request failed (HTTP '+result.status+').');
    if(typeof data.answer!=='string')throw new Error('MSTK returned an invalid AI response.');
    note.textContent=data.answer;
  }catch(error){
    note.textContent=error.message||'MSTK AI is temporarily unavailable.';
    note.classList.add('error');
  }finally{sendButton.disabled=false;}
}

const MSTK_TOOLS = [
[1,"Anime.js","Development","Local library candidate","Local animation library; not yet tested."],
[2,"Motion.dev","Development","Local library candidate","Core motion library candidate; premium features are not required."],
[3,"Kokonut UI","Development","Terms review pending","Core licence and current Pro terms need verification."],
[4,"Bklit UI","Development","Terms review pending","Core licence and Studio terms need verification."],
[5,"Manus","AI assistants","Age restricted","Reported 18+ eligibility; unavailable for under-18 use."],
[6,"Openverse","Image & design","Review pending","Potential media search; item licences and attribution must be checked."],
[7,"Earshot","Video & audio","Identity unclear","Exact product identity and public API are unconfirmed."],
[8,"Real SFX Skills","Video & audio","Identity unclear","Exact source/repository is needed before code and licence review."],
[9,"Arena Skill","Development","Age restricted","Claude Code dependency; not a standalone model API."],
[10,"Higgsfield MAGI-2","Video & audio","Age restricted","Provider API terms require adult developers and end users."],
[11,"Blender","Image & design","Local workflow candidate","Free local creative software; model and add-on licences vary."],
[12,"Claude","AI assistants","Age restricted","Consumer service terms require users to be 18+."],
[13,"ChatGPT / OpenAI","AI assistants","Eligibility review pending","Consumer and API access are separate; teen-facing API safeguards and approvals are required."],
[14,"Gemini","AI assistants","Age restricted","Reviewed Gemini API terms restrict under-18 access and teen-directed API clients."],
[15,"Seedance","Video & audio","Eligibility and cost review","Age eligibility is unresolved and documented activation requires paid funding."],
[16,"Google Flow","Video & audio","Age restricted","Reported 18+ eligibility."],
[17,"Claude (duplicate)","AI assistants","Duplicate entry","Duplicate of original entry #12; retained for list traceability."],
[18,"Grok","AI assistants","API age restricted","xAI API users must be 18+; consumer access is separate."],
[19,"Meta Muse Spark","AI assistants","Age restricted","Meta Model API terms require adult developers and end users."],
[20,"Claude Design","Image & design","Age restricted","Consumer product with 18+ terms; no separate public API established."],
[21,"Google Slides","Productivity","Integration candidate","OAuth and privacy review required; not connected."],
[22,"Fable 5.2","AI assistants","Eligibility and cost review","Model identity found; adult account, retention and cost controls remain unverified."],
[23,"Higgsfield MCP","Video & audio","Age restricted","Account-connected workflow; adult eligibility and provider terms block current use."],
[24,"Midjourney","Image & design","No supported API found","No official public API established in the reviewed sources."],
[25,"Nano Banana","Image & design","Age restricted","Gemini API age and audience terms apply."],
[26,"Perplexity","AI assistants","Age restricted","Consumer service reported 18+; API eligibility needs separate review."],
[27,"Consensus","Productivity","Terms review pending","API allowance, age rules and service terms need rechecking."],
[28,"GitHub Copilot","Development","Developer workflow only","Coding assistant; not a general-purpose MSTK model API."],
[29,"Cursor","Development","Age restricted","Reported 18+ eligibility."],
[30,"Runway ML","Video & audio","Terms review pending","API credits, age eligibility and redistribution terms need confirmation."],
[31,"Stable Diffusion","Image & design","Local/model review","Model licences differ; hosted use remains blocked pending terms."],
[32,"Adobe Firefly","Image & design","Terms review pending","Age, guardian and API-specific terms need confirmation."],
[33,"Hailuo AI","Video & audio","Terms review pending","Minimum age and regional/API terms need confirmation."],
[34,"Canva","Image & design","Integration candidate","API pricing, eligibility, privacy and app review remain open."],
[35,"Lovart","Image & design","Terms review pending","Public API and eligibility conditions need confirmation."],
[36,"CapCut","Video & audio","Manual workflow only","No general public editing API confirmed."],
[37,"Instagram Edits","Video & audio","Manual workflow only","No public developer editing API confirmed."],
[38,"Maestro Video Generator","Video & audio","Identity unclear","Exact product identity is unresolved."],
[39,"DeepSeek Harness","Development","Security review pending","Experimental harness; sandboxing and upstream model terms required."],
[40,"Headroom","Productivity","Identity unclear","Multiple unrelated products use this name."],
[41,"Claude-Mem","Development","Age restricted","Depends on Claude Code and its upstream age restrictions."],
[42,"Anthropic free Claude Code setup","Development","Age restricted","Claude Code is not a free Claude API; upstream 18+ terms apply."],
[43,"Task Observer","Development","Age restricted","Claude Code plugin; upstream age restrictions apply."],
[44,"OmniRoute","Infrastructure","Security review pending","Self-hosted gateway; each upstream provider's terms and costs still apply."],
[45,"Poe","AI assistants","Terms review pending","Consumer points and bot/API costs differ; age conditions need review."],
[46,"Ollama","Infrastructure","Local workflow candidate","Local model runner; models have separate licences and local hardware costs."],
[47,"Kixi.ai","AI assistants","Identity unclear","Exact product identity is not verified."],
[48,"Flashloop","Image & design","Terms review pending","Credits, age eligibility and generation terms need confirmation."],
[49,"Artflow.ai","Image & design","Terms review pending","API access, privacy and regional age rules need confirmation."],
[50,"ElevenLabs","Video & audio","Age restricted","Minor-directed use requires provider approval; voice cloning remains disabled."],
[51,"Fish Audio","Video & audio","Terms review pending","Guardian, voice-cloning consent and API terms need review."],
[52,"Everygen.ai","Image & design","Age restricted","Reported 18+ terms."],
[53,"ClipFlux.ai","Video & audio","Terms review pending","Paid credits, age and redistribution terms need confirmation."],
[54,"Replit","Development","Developer workflow only","Development platform; under-18 use requires guardian permission under reviewed terms."],
[55,"Saner.AI","Productivity","API review pending","Public API is unconfirmed; external keys may add costs."],
[56,"Jasper","Productivity","Terms and cost review","Business API pricing and regional age terms need confirmation."],
[57,"Tripo AI","Image & design","Terms review pending","API is separately paid; commercial and attribution restrictions apply."],
[58,"Kling AI","Video & audio","Terms review pending","API packages, redistribution, automation and regional terms need confirmation."]
];
function renderToolDirectory(){
  const list=document.getElementById('tool-list');
  if(!list)return;
  const query=(document.getElementById('tool-search').value||'').trim().toLowerCase();
  const category=document.getElementById('tool-category').value;
  const matches=MSTK_TOOLS.filter(tool=>(category==='all'||tool[2]===category)&&tool.join(' ').toLowerCase().includes(query));
  document.getElementById('tool-count').textContent='Showing '+matches.length+' of '+MSTK_TOOLS.length+' catalogue entries · 0 connected';
  list.replaceChildren();
  for(const tool of matches){
    const card=document.createElement('article');card.className='tool-card';
    const title=document.createElement('h4');title.textContent='#'+tool[0]+' · '+tool[1];
    const tags=document.createElement('div');tags.className='tool-meta';
    const categoryTag=document.createElement('span');categoryTag.className='tool-tag';categoryTag.textContent=tool[2];
    const statusTag=document.createElement('span');statusTag.className='tool-tag';
    statusTag.textContent=tool[3];
    if(/Age restricted|API age restricted/.test(tool[3]))statusTag.classList.add('restricted');
    else if(/candidate/.test(tool[3]))statusTag.classList.add('candidate');
    else statusTag.classList.add('pending');
    const detail=document.createElement('p');detail.textContent=tool[4];
    tags.append(categoryTag,statusTag);card.append(title,tags,detail);list.append(card);
  }
  if(matches.length===0){const empty=document.createElement('p');empty.className='note';empty.textContent='No tools match this search.';list.append(empty);}
}

document.addEventListener('click',(event)=>{
  const button=event.target.closest('button[data-mstk-action]');
  if(!button||button.disabled)return;
  const value=button.dataset.mstkValue;
  switch(button.dataset.mstkAction){
    case 'show': show(value); break;
    case 'signin': authenticate('signin'); break;
    case 'signup': authenticate('signup'); break;
    case 'recover': recoverAccount(); break;
    case 'signout': signOut(); break;
    case 'complete-recovery': completePasswordRecovery(); break;
    case 'verify-session': verifySession(); break;
    case 'create-workspace': createWorkspace(); break;
    case 'load-workspaces': loadWorkspaces(); break;
    case 'create-project': createProject(); break;
    case 'create-conversation': createConversation(); break;
    case 'start-comparison': startBlindComparison(); break;
    case 'choose-response': chooseBlindResponse(Number(value)); break;
    case 'reveal-comparison': revealBlindComparison(); break;
    case 'send-prompt': sendPrompt(); break;
  }
});
document.getElementById('tool-search')?.addEventListener('input',renderToolDirectory);
document.getElementById('tool-category')?.addEventListener('change',renderToolDirectory);
renderToolDirectory();
handlePasswordRecoveryCallback();
if(!authConfig())setStatus('Authentication is not configured yet. Sign-in and sign-up are disabled until the public Supabase project settings are added.','error');
