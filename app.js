// ===============================
// ARCHITIES 2026 SCANNER
// app.js
// ===============================


const API_URL =
"https://script.google.com/macros/s/AKfycbxlI804_LOtx0DBdYUuVa06jZ0yQXPbRHdGoPrUSodhIgrTq9Hch6D7lVHeW4grv1GZ/exec";


const API_KEY =
"ARCHITIES2026";


const PIN =
"2026ARCH";



let html5QrCode;

let scanAktif = true;

let flashAktif = false;

let audioCtx;

let lastHadir = 0;
let lastTotal = 0;

// ===============================
// CHECK LOGIN SESSION
// ===============================

window.onload = function(){

    const loginStatus =
    localStorage.getItem("architiesLogin");


    if(loginStatus === "true"){

        document.getElementById("loginBox")
        .style.display="none";


        const scanner =
        document.getElementById("scannerBox");


        scanner.style.display="block";

        scanner.classList.add("show-scanner");


        mulaiScanner();

    }

};


// ===============================
// LOGIN
// ===============================


function login(){


const pin =
document.getElementById("pin").value;



if(pin !== PIN){

alert("PIN salah");

return;

}

localStorage.setItem(
"architiesLogin",
"true"
);

const btn =
document.querySelector(".login-card button");

btn.disabled = true;

btn.innerHTML =
"⏳ Memverifikasi PIN...";

setTimeout(()=>{

    btn.innerHTML =
    "✅ Login Berhasil";

    setTimeout(()=>{

        document.getElementById("loginBox")
        .classList.add("hide-login");

        setTimeout(()=>{

            document.getElementById("loginBox")
            .style.display="none";

            const scanner =
document.getElementById("scannerBox");

scanner.style.display="block";

scanner.classList.add("show-scanner");

mulaiScanner();
            
        },500);

    },500);

},700);


}


function togglePin(){

    const pin =
    document.getElementById("pin");

    const eye =
    document.getElementById("togglePin");

    if(pin.type==="password"){

        pin.type="text";
        eye.innerHTML="🙈";

    }else{

        pin.type="password";
        eye.innerHTML="👁️";

    }

}






// ===============================
// START SCANNER
// ===============================


async function mulaiScanner(){

try{


html5QrCode =
new Html5Qrcode("reader");



const config = {

fps:10,

qrbox:{
width:250,
height:250
}

};



await html5QrCode.start(

{
facingMode:"environment"
},

config,

onScanSuccess,

(errorMessage)=>{

}

);



loadDashboard();



}

catch(err){

console.error(
"Scanner Error:",
err
);


alert(
"Kamera gagal dibuka\n\n"+err.message
);


}

}


// ===============================
// FLASH
// ===============================


async function aktifkanFlash(){


try{


if(!html5QrCode)
return;



const capabilities =
html5QrCode
.getRunningTrackCapabilities();



if(!capabilities.torch){

alert(
"Flash tidak tersedia"
);

return;

}



flashAktif = !flashAktif;

const btn = document.getElementById("flash");

await html5QrCode
.applyVideoConstraints({

advanced:[
{
torch:flashAktif
}
]

});

if(flashAktif){

    btn.innerHTML = "💡 Flash ON";
    btn.classList.add("flash-on");

}else{

    btn.innerHTML = "🔦 Flash OFF";
    btn.classList.remove("flash-on");

}

}

catch(err){

console.log(err);

}


}










// ===============================
// SCAN SUCCESS
// ===============================


async function onScanSuccess(decodedText){



if(!scanAktif)
return;



scanAktif=false;



const status =
document.getElementById("status");



status.className="waiting";

status.innerHTML=
"⏳ Memverifikasi QR Code...";





try{


const response =
await fetch(

API_URL +

"?action=checkin&id=" +

encodeURIComponent(decodedText)

);



const res =
await response.json();



tampilkanStatus(res);



await loadDashboard();


}

catch(err){


console.error(err);


status.className="error";

status.innerHTML=
"❌ Server Error";


}





setTimeout(()=>{


scanAktif=true;


status.className="waiting";
status.classList.remove("pop");

status.innerHTML=
"📷 Arahkan pada QR Code";


},3500);



}










// ===============================
// STATUS
// ===============================


function tampilkanStatus(res){



const status =
document.getElementById("status");



if(res.success){



beepSuccess();



status.className=
"success pop";


status.innerHTML=
"✅ Check-in Berhasil";

document.getElementById(
"scannerLast"
).innerHTML=
res.nama;



if(navigator.vibrate){

navigator.vibrate(150);

}



}



else{


if(res.type==="duplicate"){

    status.className="duplicate pop";

    beepDuplicate();

    status.innerHTML=
    "⚠️ Peserta Sudah Check-in";

}else{

    status.className="error pop";

    beepError();

    status.innerHTML=
    "❌ QR Code Tidak Terdaftar";

}


if(navigator.vibrate){

navigator.vibrate(
[100,80,100]
);

}


}


}










// ===============================
// DASHBOARD MINI
// ===============================


async function loadDashboard(){



try{


const res =
await fetch(
API_URL+"?action=dashboard"
);



const data =
await res.json();




const hadirEl =
document.getElementById("scannerHadir");

const totalEl =
document.getElementById("scannerTotal");

if(data.hadir != lastHadir){

    hadirEl.classList.remove("count-pop");

    void hadirEl.offsetWidth;

    hadirEl.classList.add("count-pop");

}

if(data.total != lastTotal){

    totalEl.classList.remove("count-pop");

    void totalEl.offsetWidth;

    totalEl.classList.add("count-pop");

}

hadirEl.innerHTML = data.hadir;

totalEl.innerHTML = data.total;

lastHadir = data.hadir;

lastTotal = data.total;





const persen =
data.total>0

?

Math.round(
data.hadir*100/data.total
)

:

0;




document.getElementById(
"scannerProgressBar"
)
.style.width=
persen+"%";




document.getElementById(
"scannerPersen"
)
.innerHTML=
persen+"%";



}



catch(err){

console.log(err);

}



}









// ===============================
// SOUND
// ===============================


function getAudio(){


if(!audioCtx){

audioCtx =
new (
window.AudioContext ||
window.webkitAudioContext
)();

}


return audioCtx;


}







function beepSuccess(){

    const ctx = getAudio();

    if(ctx.state==="suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";

    osc.frequency.setValueAtTime(700, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(
        1100,
        ctx.currentTime + 0.12
    );

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + 0.18
    );

    osc.start();
    osc.stop(ctx.currentTime + 0.18);

}


function beepDuplicate(){

    const ctx = getAudio();

    if(ctx.state==="suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "triangle";

    osc.frequency.setValueAtTime(650, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(
        420,
        ctx.currentTime + 0.15
    );

    gain.gain.setValueAtTime(.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + .18
    );

    osc.start();
    osc.stop(ctx.currentTime+.18);

}



function beepError(){

    const ctx = getAudio();

    if(ctx.state==="suspended") ctx.resume();

    [300,220].forEach((freq,i)=>{

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type="square";

        osc.frequency.value=freq;

        const start =
        ctx.currentTime + i*0.18;

        gain.gain.setValueAtTime(.28,start);

        gain.gain.exponentialRampToValueAtTime(
            .0001,
            start+.12
        );

        osc.start(start);
        osc.stop(start+.12);

    });

}

function logout(){

localStorage.removeItem(
"architiesLogin"
);


location.reload();

}
