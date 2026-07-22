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
async function loadAttendance(){

    try{

        const res = await fetch(
            API_URL + "?action=attendance"
        );

        const data = await res.json();

        const tbody =
            document.getElementById("attendanceBody");

        const keyword =
            document.getElementById("search")
            .value
            .toLowerCase();

        tbody.innerHTML = "";

        const hasil = data.filter(p =>

            p.nama.toLowerCase().includes(keyword) ||

            p.id.toLowerCase().includes(keyword)

        );

        if(hasil.length == 0){

            tbody.innerHTML = `
                <tr>
                    <td colspan="4">
                        Tidak ada peserta ditemukan
                    </td>
                </tr>
            `;

            return;
        }

        hasil.reverse();

        hasil.forEach((p,index)=>{

            tbody.innerHTML += `
                <tr>

                    <td>${index+1}</td>

                    <td>${p.id}</td>

                    <td>${p.nama}</td>

                    <td>${p.waktu}</td>

                </tr>
            `;

        });

    }catch(err){

        console.error(err);

    }

}

loadDashboard();
loadAttendance();

setInterval(()=>{

    loadDashboard();
    loadAttendance();

},5000);

document
.getElementById("search")
.addEventListener("input",loadAttendance);
