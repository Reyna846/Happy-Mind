export const slideProgress=(distance:number,travel:number)=>travel<=0?0:Math.max(0,Math.min(1,distance/travel));
export const slideComplete=(progress:number)=>progress>=.9;
