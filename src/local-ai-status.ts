export function preparationProgress(progress:number,text=''){
 const percent=Math.round(Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0))*100);
 const stage=/shader|compil|pipeline/i.test(text)?'Setting up your device':/fetch|download|cache|load.*param/i.test(text)?'Loading the model':'Preparing companion';
 return `${stage} · ${percent}%`;
}
export function localAIFailure(error:unknown,stage:'prepare'|'reply'){
 const message=error instanceof Error?error.message:String(error);
 if(/timeout/i.test(message))return stage==='prepare'?'Preparation took too long. The first download is large; check your connection, then try again.':'The local model took too long to reply. Your message is still here. Try a shorter message or prepare it again.';
 if(/gpu|adapter|shader|device.*lost|memory|allocation|buffer.*size/i.test(message))return 'The local model could not run on this device’s graphics hardware. Try another WebGPU-capable browser or device; the quiet activities still work.';
 if(/fetch|network|download|https|connection/i.test(message))return 'The model download was interrupted. Check your connection and try Prepare again; downloaded files may already be cached.';
 return stage==='prepare'?'The local model could not finish preparing. Try again in a WebGPU-capable browser.':'The model returned an incomplete or unusable reply. Your message is still here. Prepare the companion again to retry.';
}
