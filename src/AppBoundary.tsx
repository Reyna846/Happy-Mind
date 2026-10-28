import {Component,type ReactNode} from 'react';

export class AppBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){
  if(this.state.failed)return <div className="entry-screen"><h1>A little pause.</h1><p>This room needs a fresh start.<br/>This visit’s words will clear.</p><button className="primary" onClick={()=>this.setState({failed:false})}>Open my room again</button></div>;
  return this.props.children;
 }
}
