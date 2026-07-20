const API_URL =
"https://script.google.com/macros/s/AKfycbxlI804_LOtx0DBdYUuVa06jZ0yQXPbRHdGoPrUSodhIgrTq9Hch6D7lVHeW4grv1GZ/exec";

async function loadDashboard(){

    try{
        
    const res = await fetch(
        API_URL + "?action=dashboard"
    );

    const data = await res.json();

    document.getElementById("total").innerHTML =
        data.total;

    document.getElementById("hadir").innerHTML =
        data.hadir;

    document.getElementById("belum").innerHTML =
        data.belum;

    const persen =
        data.total > 0
        ? Math.round(data.hadir * 100 / data.total)
        : 0;

    document.getElementById("persen").innerHTML =
        persen + "%";

    document.getElementById("progressBar").style.width =
        persen + "%";

}catch(err){

    console.error("Dashboard Error:", err);
    }
}

loadDashboard();

setInterval(loadDashboard,5000);
