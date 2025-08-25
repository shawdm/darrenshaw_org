const repl = document.getElementById('strudel-repl');
const editor = repl.editor;

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key=== "Enter" )  play()
    if (e.ctrlKey && e.key === ".")  stop()
});

function stop(){
    editor.stop();
}

function play(){
    editor.evaluate();
}