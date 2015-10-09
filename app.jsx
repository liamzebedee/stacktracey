function escapeRegExp(str) {
if(str == "") return "";
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

var App = React.createClass({
  getInitialState: function(){
    return { stackTraceRaw: '' };
  },
  
  stackTraceEntered: function(event){
    var stackTraceRaw = event.target.value;
    this.setState({ stackTraceRaw: stackTraceRaw});
  },
  
  render: function() {
    return (
      <div>
        <label labelFor="stacktrace">Raw stacktrace:</label><textarea class="input textarea" name="stacktrace" onChange={this.stackTraceEntered} value={this.state.stackTraceRaw} />
        <StackTrace raw={this.state.stackTraceRaw}/>
      </div>
    );
  }
});

var StackTrace = React.createClass({
  getInitialState: function(){
    return { currentHighlight: '' };
  },
  
  highlightMethod: function(i){
    var stackTraceAsLines = this.props.raw.split('\n');
    this.setState({ currentHighlight: stackTraceAsLines[i] });
  },
  
  highlightBit: function(i){
    var stackTraceAsLines = this.props.raw.split('\n');
    var selection = window.getSelection();
    if(selection.focusOffset == 0) return;
    var currentHighlight = stackTraceAsLines[i].substring(0, selection.focusOffset);
    if(currentHighlight == "") return;
    this.setState({ currentHighlight: currentHighlight });
  },
  
  setHighlightManually: function(event) {
     this.setState({ currentHighlight: event.target.value });
  },
  
  render: function(){
    if(!this.props.raw) return null;
    var self = this;
    var stackTraceAsLines = this.props.raw.split('\n');
    var regex = "";
    if(this.state.currentHighlight != "") {
      regex = "(!at )?(?<stack>"+escapeRegExp(this.state.currentHighlight)+")(?<ahead>[\\w\\d\\.\\[\\]\\`]*(?![0-9\\w\\,\\`\\s\\&\\[\\]]*[\\(]))(?<methodAndParams>[\\w\\.]*\\([0-9\\w\\,\\`\\s\\&\\[\\]]*\\))|"+escapeRegExp(this.state.currentHighlight);
    }
    var magicRegex = XRegExp(regex);
    
    return (
      <div className='stacktrace'>
        <input value={this.state.currentHighlight} onChange={this.setHighlightManually} />
      {stackTraceAsLines.map(function(line, i){
        var things = XRegExp.exec(line, magicRegex);
        if(things && things.methodAndParams) {
          return (<div key={i}>
            <span onClick={self.highlightBit.bind(this, i)} className="stack">{things.stack+things.ahead}</span><span className="method" onClick={self.highlightMethod.bind(this, i)}>{things.methodAndParams}</span>
           </div>
           );
        } else {
          return <div key={i} onClick={self.highlightBit.bind(this, i)}>{line}</div>;
        }
      })}
      </div>
    );
  }
});

React.render(
  <App />,
  document.getElementById('app')
);
