// Consume a single recognition turn once; Chat keeps it as an editable draft.
export class DictationTurn{
 private words='';private finished=false;
 append(words:string){if(!this.finished)this.words=(this.words+' '+words.trim()).trim().slice(0,2000);}
 complete(send:boolean){if(this.finished)return null;this.finished=true;return send&&this.words?this.words:null;}
 cancel(){this.finished=true;this.words='';}
}
