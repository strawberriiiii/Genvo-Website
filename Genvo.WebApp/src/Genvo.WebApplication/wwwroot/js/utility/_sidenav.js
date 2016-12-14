function openNav() {
    const sidebarBtn = document.getElementById("drawer-edge-left");
    sidebarBtn.setAttribute("onclick", "closeNav()");
    sidebarBtn.firstChild.className = "glyphicon glyphicon-chevron-left";

    document.getElementById("tool-drawer-left").style.width = "270px";
}

function closeNav() {
    const sidebarBtn = document.getElementById("drawer-edge-left");
    sidebarBtn.setAttribute("onclick", "openNav()");
    sidebarBtn.firstChild.className = "glyphicon glyphicon-chevron-right";

    document.getElementById("tool-drawer-left").style.width = "13px";
}

function openBottomNav() {
    const btn = document.getElementById("drawer-btn-bottom");
    btn.setAttribute("onclick", "closeBottomNav()");
    btn.firstChild.className = "glyphicon glyphicon-chevron-down";

    document.getElementById("tool-drawer-bottom").style.height = "150px";
}

function closeBottomNav() {
    const btn = document.getElementById("drawer-btn-bottom");
    btn.setAttribute("onclick", "openBottomNav()");
    btn.firstChild.className = "glyphicon glyphicon-chevron-up";

    document.getElementById("tool-drawer-bottom").style.height = "20px";
}