// ===============================
// ARCHITIES SCANNER
// app.js - BAGIAN 1
// ===============================

// ===============================
// KONFIGURASI
// ===============================

const API_URL =
"https://script.google.com/macros/s/AKfycbxj4MIGkkoV9qM_TSHTKrOG6znhld8aDLg0DaVi-XSx4AvzY6joFF8xdF8PyCt9KnE4/exec";

const API_KEY = "ARCHITIES2026";

const PIN = "2026ARCH";

// ===============================

let html5QrCode;
let scanAktif = true;
let flashAktif = false;

const audioCtx =
    new (window.AudioContext || window.webkitAudioContext)();

// ===============================
// LOGIN
// ===============================

function login(){

    const pin = document.getElementById("pin").value;

    if(pin !== PIN){

        alert("PIN salah");

        return;

    }

    document.getElementById("loginBox").style.display="none";
    document.getElementById("scannerBox").style.display="block";

    mulaiScanner();

}

// ===============================
// MULAI SCANNER
// ===============================

async function mulaiScanner(){

    html5QrCode = new Html5Qrcode("reader");

    try{

        const cameras = await Html5Qrcode.getCameras();

        if(cameras.length===0){

            alert("Tidak ada kamera.");

            return;

        }

        // kamera belakang
        const camera =
            cameras[cameras.length-1].id;

        await html5QrCode.start(

            camera,

            {

                fps:10,

                qrbox:{
                    width:250,
                    height:250
                }

            },

            onScanSuccess,

            ()=>{}

        );

        loadDashboard();

    }

    catch(err){

        console.log(err);

        alert(err);

    }

}

// ===============================
// FLASH
// ===============================

async function aktifkanFlash(){

    try{

        if(!html5QrCode) return;

        const track =
        html5QrCode.getRunningTrack();

        if(!track) return;

        flashAktif = !flashAktif;

        await track.applyConstraints({

            advanced:[

                {
                    torch:flashAktif
                }

            ]

        });

    }

    catch(err){

        console.log(err);

    }

}



// ===============================
// QR BERHASIL DISCAN
// ===============================

async function onScanSuccess(decodedText) {

    if (!scanAktif) return;

    scanAktif = false;

    const status = document.getElementById("status");
    status.className = "waiting";
    status.innerHTML = "Memeriksa...";

    try {

        const response = await fetch(
            API_URL +
            "?action=checkin&id=" +
            encodeURIComponent(decodedText)
        );

        const res = await response.json();

        tampilkanStatus(res);

        await loadDashboard();

    } catch (err) {

        console.error(err);

        status.className = "error";
        status.innerHTML = "❌ Gagal terhubung ke server";

    }

    setTimeout(() => {

        scanAktif = true;

        status.className = "waiting";
        status.innerHTML = "Menunggu Scan...";

    }, 2000);

}

// ===============================
// TAMPILKAN STATUS
// ===============================

function tampilkanStatus(res){

    const status = document.getElementById("status");

    if(res.success){
        beepSuccess();
        status.className = "success";

        status.innerHTML =
        "✅ " + res.nama;

        document.getElementById("last").innerHTML =
        res.nama;

        if(navigator.vibrate){

            navigator.vibrate(150);

        }

    }

    else{
        beepError();
        status.className = "error";

        if(res.type=="duplicate"){

            status.innerHTML="🔴 Sudah Hadir";
            
    }else{

            status.innerHTML="❌ QR Tidak Valid";

        }

        if(navigator.vibrate){

            navigator.vibrate([100,80,100]);
            
        }

    }
}
// ===============================
// DASHBOARD
// ===============================

async function loadDashboard(){

    try{

        const res = await fetch(
            API_URL + "?action=dashboard"
        );

        const data = await res.json();

        document.getElementById("hadir").innerHTML = data.hadir;
        document.getElementById("total").innerHTML = data.total;

        const persen =
            data.total > 0
                ? Math.round((data.hadir / data.total) * 100): 0;

        document.getElementById("progressBar").style.width = persen + "%";
        document.getElementById("persen").innerHTML = persen + "%";

    }
    catch(err){

        console.log(err);

    }

}





// ===============================
// BEEP
// ===============================

function beepSuccess(){

    if(audioCtx.state === "suspended"){
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.frequency.value = 900;
    osc.type = "sine";

    gain.gain.setValueAtTime(
        0.3,
        audioCtx.currentTime
    );

    osc.start();

    gain.gain.exponentialRampToValueAtTime(
        0.00001,
        audioCtx.currentTime + 0.15
    );

    osc.stop(audioCtx.currentTime + 0.15);

}

function beepError(){

    if(audioCtx.state === "suspended"){
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.frequency.value = 250;
    osc.type = "square";

    gain.gain.setValueAtTime(
        0.3,
        audioCtx.currentTime
    );

    osc.start();

    gain.gain.exponentialRampToValueAtTime(
        0.00001,
        audioCtx.currentTime + 0.30
    );

    osc.stop(audioCtx.currentTime + 0.30);

}
