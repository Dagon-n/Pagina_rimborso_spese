function mostraForm(){

    document.getElementById('parteSinistra').style.display = 'block';
    document.getElementById('parteDestra').style.width = '50%';
    document.getElementById('mostra_form').style.display = 'none';

}

function nascondiForm(){

    document.getElementById('parteSinistra').style.display = 'none';
    document.getElementById('parteDestra').style.width = '100%';
    document.getElementById('parteDestra').style.height = '100%';
    document.getElementById('mostra_form').style.display = 'block';
    document.getElementById('tabella_risultato').style.marginRight = '15px';
    
}