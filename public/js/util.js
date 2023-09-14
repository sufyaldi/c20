function confirmation(name) {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "block"; //  overlay
    const answer = confirm(`Apakah kamu serius akan menghapus data '${name}'`);
    setTimeout(() => {
        overlay.style.display = "none";
    }, 500);
    return answer;
}
