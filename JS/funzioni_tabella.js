let spese = [];
let maxRimborsiSpese = [];
let key = 0;
let totale_importo = 0;
let totale_rimborso = 0;
let btn_eliminariga = "<button class='btn_eliminariga' onclick='cancellaElemento(this)'><i class='fa-solid fa-trash-can fa-lg'></i></button>";
let btn_editariga = "<button class='btn_editariga' id='btn_editariga' onclick='editaElemento(this)'><i class='fa-solid fa-pen-to-square fa-lg'></i></button>"
let nuoviDati = '';
let importoDaSommare = 0;

const api_url_maxRimborsoSpese = 'https://run.mocky.io/v3/87ce05ff-86d8-4662-9ee8-b51225bee287';

addEventListener('load', (event) => { /* Carica JSON dati rimborsi spese */

    fetch(api_url_maxRimborsoSpese, { 
        method: 'GET'
      })
      .then(function(response) { return response.json(); })
      .then(function(json) {
        
          maxRimborsiSpese = json;
      
      });

});

/* funzione submit del form */

function invia(){ /* PRINCIPALE */

    aggiungiDati();
    pushDati();
    aggiungiRiga();
    calcoloTotaleImporto()
    visibilitàTabella();
    pulisciForm();

    return false;

}

function aggiungiDati() {

    let dataUtente = document.getElementById('selezione_data').value;
    let tipoSpeseUtente = document.getElementById('tipo_spesa').value;
    let importoUtente = parseFloat(document.getElementById('importo_scelto').value);
    let ricevutaUtente = document.querySelector('input[name="ricevuta"]:checked').value;

    nuoviDati = {'data':dataUtente, 'tipoDiSpesa':tipoSpeseUtente, 'importo':importoUtente, 'ricevuta':ricevutaUtente, 'key':key};

}

function pushDati() {

    spese.push(nuoviDati);    

}

function controlloData() {

    let tabella = document.getElementById('tcorpo');
    let tabellaLength = tabella.rows.length;
    let dataDaInserire = parseInt(nuoviDati.data.replaceAll('-', ''));

    if(tabellaLength == 0){

        return 0;

    }

    for(let i = 0; i < tabellaLength-1; i++){

        let dataTabella = parseInt(tabella.rows[i].cells[0].innerText.replaceAll('-', ''));
        
        if (dataTabella > dataDaInserire){

            return i;

        }

    }

    return -1;

}

function aggiungiRiga() {

    let indexRiga = controlloData();
    let tabella = document.getElementById('tcorpo');
    let riga = tabella.insertRow(indexRiga);

    let cella0 = riga.insertCell(0);
    cella0.innerHTML = nuoviDati.data;
    let cella1 = riga.insertCell(1).innerHTML = nuoviDati.tipoDiSpesa;
    let cella2 = riga.insertCell(2).innerHTML = nuoviDati.importo + ' €';
    let cella3 = riga.insertCell(3).innerHTML = nuoviDati.ricevuta;
    let cella4 = riga.insertCell(4).innerHTML = "";
    let cella5 = riga.insertCell(5).innerHTML = btn_editariga;
    let cella6 = riga.insertCell(6).innerHTML = btn_eliminariga;

    cella0.parentNode.setAttribute('class', nuoviDati.key);

    key++;

}

function calcoloTotaleImporto() {

    let somma = spese.reduce((x, y) => ({importo: x.importo + y.importo}));
    totale_importo = somma.importo + ' €';
    document.getElementById('totale_importo').innerHTML = totale_importo;

}

function visibilitàTabella() {

    let lunghezzaTabella = document.getElementById('tcorpo').rows.length;

    if(lunghezzaTabella > 0){

        document.getElementById('tabella_risultato').style.display = 'block';

    }else{

        document.getElementById('tabella_risultato').style.display = 'none';

    }
    

}

function pulisciForm() {

    document.getElementById('form_gstrmb').reset();

}

/* funzione tasto del form richiedi approvazione */

function richiediApprovazione() { /* PRINCIPALE */

    totale_rimborso = 0;

    let tabella = document.getElementById('tcorpo').rows.length; 

    for (let i = 0; i < tabella; i++){

        let tipoImportoRiga = document.getElementById('tcorpo').rows[i].cells[1].innerText.toLowerCase();
        let maxRimborsabile = maxRimborsiSpese[tipoImportoRiga]
        console.log(maxRimborsabile);
        let importoRiga = parseInt(document.getElementById('tcorpo').rows[i].cells[2].innerText);
        let ricevutaRiga = document.getElementById('tcorpo').rows[i].cells[3].innerText;
        let cellaRimborso = document.getElementById('tcorpo').rows[i].cells[4];

        if(ricevutaRiga == "No" && importoRiga > 10){

            cellaRimborso.style.color='red';
            importoRiga = 10;
            cellaRimborso.innerHTML = importoRiga + ' € <br><div class="dettaglio_rimborso">(Senza ricevuta il massimo rimborsabile è 10€)</div>';
            totale_rimborso += importoRiga;

        }else if(importoRiga < maxRimborsabile){

            cellaRimborso.innerHTML = importoRiga + ' € <br><div class="dettaglio_rimborso">(Soglia massima rimborsabile: ' + maxRimborsabile + '€)</div>';
            totale_rimborso += importoRiga;

        }else{

            cellaRimborso.innerHTML = maxRimborsabile + ' €';
            totale_rimborso += maxRimborsabile;

        }

        document.getElementById('totale_rimborso').innerHTML = totale_rimborso + " €";
        document.getElementById('totale_rimborso').style.backgroundColor = 'yellow';

    } 

}

/* funzione tasto elimina riga tabella */

function cancellaElemento(button) { /* PRINCIPALE */

    let avviso = confirm('Sicuro di voler eliminare questa riga?');
    if(avviso == false){return;};

    let arraySelezionato;
    let rigaSelezionata;
    let classeRigaSelezionata;

    trovaElementiSelezionati(button);
    aggiornaTotaleImporto();
    aggiornaTotaleRimborso();
    eliminaObjArray();
    eliminaRiga();

}

function trovaElementiSelezionati(button) {

    rigaSelezionata = button.parentNode.parentNode;
    classeRigaSelezionata = button.parentNode.parentNode.getAttribute('class');
    arraySelezionato = spese.filter(spesa => spesa.key == classeRigaSelezionata);

}

function aggiornaTotaleImporto() {

    let spesaDaSottrarre = spese
    .filter(obj => obj.key == classeRigaSelezionata)
    .map(function(obj){return obj.importo});

    totale_importo = parseInt(totale_importo) - parseInt(spesaDaSottrarre);
    
    document.getElementById('totale_importo').innerHTML = totale_importo + ' €';

}

function aggiornaTotaleRimborso() {

    let rimborsoDaSottrarre = parseInt(rigaSelezionata.cells[4].innerText);

    if (isNaN(rimborsoDaSottrarre) == true){

        return;

    }else{

        totale_rimborso -= rimborsoDaSottrarre;
        document.getElementById('totale_rimborso').innerHTML = totale_rimborso + ' €';

    };

}

function eliminaObjArray() {

    let classeRiga = rigaSelezionata.getAttribute('class');

    let objDaEliminare = spese.map(spesa => spesa.key).indexOf(parseInt(classeRiga));

    spese.splice(objDaEliminare, 1);

    console.log(spese);

}

function eliminaRiga() {

    rigaSelezionata.parentNode.removeChild(rigaSelezionata);

}

/* funzione tasto edita tabella */

let arraySelezionato;
let rigaSelezionata;
let classeRigaSelezionata;

function editaElemento(button){ /* PRINCIPALE */

    trovaElementiSelezionati(button);
    mostraPopup();
    riempimentoDati();

}

function mostraPopup() {

    document.getElementById('popup_editor').style.display = 'block';

}

function riempimentoDati() {

    document.getElementById('data_rigaselezionata').innerHTML = arraySelezionato[0].data;
    document.getElementById('tipospesa_rigaselezionata').innerHTML = arraySelezionato[0].tipoDiSpesa;
    document.getElementById('importo_rigaselezionata').innerHTML = arraySelezionato[0].importo + ' €';

    if(arraySelezionato[0].ricevuta == 'Si'){

        document.getElementById('edit_ricevuta_si').checked = true;
        document.getElementById('edit_ricevuta_no').checked = false;

    }else{

        document.getElementById('edit_ricevuta_no').checked = true;
        document.getElementById('edit_ricevuta_si').checked = false;

    }

}

/* funzione tasto invia modifiche editate */

function confermaModifiche(){ /* PRINCIPALE */

    let editData;
    let editTipoSpesa;
    let editImporto;
    let editRicevuta;

    salvaDatiModificati();
    aggiornaArrayeRiga();
    calcoloTotaleImporto();
    modificheCSS();
    setTimeout(function() { rimuoviIdAnimazione(); }, 3001);

    return false;

}

function salvaDatiModificati() {

    editData = document.getElementById('edit_data').value;
    editTipoSpesa = document.getElementById('edit_tipo_spesa').value;
    editImporto = parseFloat(document.getElementById('edit_importo_scelto').value);
    editRicevuta = document.querySelector('input[name="edit_ricevuta"]:checked').value;

}

function aggiornaArrayeRiga() {

    let keyArraySelezionato = arraySelezionato[0].key;
    let indexArray = spese.findIndex((obj => obj.key == keyArraySelezionato));

    spese[indexArray].data = editData;
    spese[indexArray].tipoDiSpesa = editTipoSpesa;
    spese[indexArray].importo = editImporto;
    spese[indexArray].ricevuta = editRicevuta;

    rigaSelezionata.cells[0].innerText = spese[indexArray].data;
    rigaSelezionata.cells[1].innerText = spese[indexArray].tipoDiSpesa;
    rigaSelezionata.cells[2].innerText = spese[indexArray].importo + ' €';
    rigaSelezionata.cells[3].innerText = spese[indexArray].ricevuta;

    document.getElementById('popup').reset();

}

function modificheCSS() {

    document.getElementById('popup_editor').style.display = 'none'; 
    rigaSelezionata.setAttribute('id', 'rigaEditata');

}

function rimuoviIdAnimazione() {

    rigaSelezionata.removeAttribute('id');

}

/* funzione tasto chiudi popup edit */

function chiudipopup() { /* PRINCIPALE */

    document.getElementById('popup_editor').style.display = 'none'; 

}