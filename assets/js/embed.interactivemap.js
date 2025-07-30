/*------------------------------*/
/*    Interactive Map Script    */
/*------------------------------*/

!(function () {
"use strict";
window.addEventListener("message", function (a) {
    if (void 0 !== a.data["datawrapper-height"]) {
    var e = document.querySelectorAll("iframe");
    for (var t in a.data["datawrapper-height"])
        for (var r, i = 0; (r = e[i]); i++)
        if (r.contentWindow === a.source) {
            var d = a.data["datawrapper-height"][t] + "px";
            r.style.height = d;
        }
    }
});
})();