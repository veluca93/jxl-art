var jxl = (() => {
  var _scriptDir = import.meta.url;

  return function (jxl) {
    jxl = jxl || {};

    var g;
    g || (g = typeof jxl !== "undefined" ? jxl : {});
    var aa, ba;
    g.ready = new Promise(function (a, b) {
      aa = a;
      ba = b;
    });
    var ca = Object.assign({}, g),
      ea = [],
      fa = "./this.program",
      ha = (a, b) => {
        throw b;
      },
      m = "",
      ia;
    m = self.location.href;
    _scriptDir && (m = _scriptDir);
    0 !== m.indexOf("blob:")
      ? (m = m.substr(0, m.replace(/[?#].*/, "").lastIndexOf("/") + 1))
      : (m = "");
    ia = (a) => {
      var b = new XMLHttpRequest();
      b.open("GET", a, !1);
      b.responseType = "arraybuffer";
      b.send(null);
      return new Uint8Array(b.response);
    };
    var ja = g.print || console.log.bind(console),
      t = g.printErr || console.warn.bind(console);
    Object.assign(g, ca);
    ca = null;
    g.arguments && (ea = g.arguments);
    g.thisProgram && (fa = g.thisProgram);
    g.quit && (ha = g.quit);
    var ka;
    g.wasmBinary && (ka = g.wasmBinary);
    var noExitRuntime = g.noExitRuntime || !0;
    "object" != typeof WebAssembly && u("no native wasm support detected");
    var la,
      ma = !1,
      na = new TextDecoder("utf8");
    function oa(a) {
      for (var b = 0; a[b] && !(NaN <= b); ) ++b;
      return na.decode(
        a.buffer ? a.subarray(0, b) : new Uint8Array(a.slice(0, b)),
      );
    }
    function pa(a, b) {
      if (!a) return "";
      b = a + b;
      for (var c = a; !(c >= b) && w[c]; ) ++c;
      return na.decode(w.subarray(a, c));
    }
    function qa(a, b, c, d) {
      if (!(0 < d)) return 0;
      var e = c;
      d = c + d - 1;
      for (var f = 0; f < a.length; ++f) {
        var k = a.charCodeAt(f);
        if (55296 <= k && 57343 >= k) {
          var l = a.charCodeAt(++f);
          k = (65536 + ((k & 1023) << 10)) | (l & 1023);
        }
        if (127 >= k) {
          if (c >= d) break;
          b[c++] = k;
        } else {
          if (2047 >= k) {
            if (c + 1 >= d) break;
            b[c++] = 192 | (k >> 6);
          } else {
            if (65535 >= k) {
              if (c + 2 >= d) break;
              b[c++] = 224 | (k >> 12);
            } else {
              if (c + 3 >= d) break;
              b[c++] = 240 | (k >> 18);
              b[c++] = 128 | ((k >> 12) & 63);
            }
            b[c++] = 128 | ((k >> 6) & 63);
          }
          b[c++] = 128 | (k & 63);
        }
      }
      b[c] = 0;
      return c - e;
    }
    function ra(a) {
      for (var b = 0, c = 0; c < a.length; ++c) {
        var d = a.charCodeAt(c);
        127 >= d
          ? b++
          : 2047 >= d
            ? (b += 2)
            : 55296 <= d && 57343 >= d
              ? ((b += 4), ++c)
              : (b += 3);
      }
      return b;
    }
    var sa, y, w, A, ta, C, D, ua, va;
    function wa() {
      var a = la.buffer;
      sa = a;
      g.HEAP8 = y = new Int8Array(a);
      g.HEAP16 = A = new Int16Array(a);
      g.HEAP32 = C = new Int32Array(a);
      g.HEAPU8 = w = new Uint8Array(a);
      g.HEAPU16 = ta = new Uint16Array(a);
      g.HEAPU32 = D = new Uint32Array(a);
      g.HEAPF32 = ua = new Float32Array(a);
      g.HEAPF64 = va = new Float64Array(a);
    }
    var xa,
      ya = [],
      za = [],
      Aa = [],
      Ba = [];
    function Ca() {
      var a = g.preRun.shift();
      ya.unshift(a);
    }
    var F = 0,
      Da = null,
      Ea = null;
    function u(a) {
      if (g.onAbort) g.onAbort(a);
      a = "Aborted(" + a + ")";
      t(a);
      ma = !0;
      a = new WebAssembly.RuntimeError(
        a + ". Build with -sASSERTIONS for more info.",
      );
      ba(a);
      throw a;
    }
    function Fa() {
      return G.startsWith("data:application/octet-stream;base64,");
    }
    var G;
    if (g.locateFile) {
      if (((G = "jxl.wasm"), !Fa())) {
        var Ga = G;
        G = g.locateFile ? g.locateFile(Ga, m) : m + Ga;
      }
    } else G = new URL("jxl.wasm", import.meta.url).toString();
    function Ha() {
      var a = G;
      try {
        if (a == G && ka) return new Uint8Array(ka);
        if (ia) return ia(a);
        throw "both async and sync fetching of the wasm failed";
      } catch (b) {
        u(b);
      }
    }
    function Ia() {
      return ka || "function" != typeof fetch
        ? Promise.resolve().then(function () {
            return Ha();
          })
        : fetch(G, { credentials: "same-origin" })
            .then(function (a) {
              if (!a.ok) throw "failed to load wasm binary file at '" + G + "'";
              return a.arrayBuffer();
            })
            .catch(function () {
              return Ha();
            });
    }
    var H, I;
    function Ja(a) {
      this.name = "ExitStatus";
      this.message = "Program terminated with exit(" + a + ")";
      this.status = a;
    }
    function Ka(a) {
      for (; 0 < a.length; ) a.shift()(g);
    }
    function La(a) {
      this.aa = a - 24;
      this.vb = function (b) {
        D[(this.aa + 4) >> 2] = b;
      };
      this.ob = function (b) {
        D[(this.aa + 8) >> 2] = b;
      };
      this.rb = function () {
        C[this.aa >> 2] = 0;
      };
      this.qb = function () {
        y[(this.aa + 12) >> 0] = 0;
      };
      this.sb = function () {
        y[(this.aa + 13) >> 0] = 0;
      };
      this.xa = function (b, c) {
        this.pb();
        this.vb(b);
        this.ob(c);
        this.rb();
        this.qb();
        this.sb();
      };
      this.pb = function () {
        D[(this.aa + 16) >> 2] = 0;
      };
    }
    var Ma = 0,
      Na = (a, b) => {
        for (var c = 0, d = a.length - 1; 0 <= d; d--) {
          var e = a[d];
          "." === e
            ? a.splice(d, 1)
            : ".." === e
              ? (a.splice(d, 1), c++)
              : c && (a.splice(d, 1), c--);
        }
        if (b) for (; c; c--) a.unshift("..");
        return a;
      },
      J = (a) => {
        var b = "/" === a.charAt(0),
          c = "/" === a.substr(-1);
        (a = Na(
          a.split("/").filter((d) => !!d),
          !b,
        ).join("/")) ||
          b ||
          (a = ".");
        a && c && (a += "/");
        return (b ? "/" : "") + a;
      },
      Oa = (a) => {
        var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
          .exec(a)
          .slice(1);
        a = b[0];
        b = b[1];
        if (!a && !b) return ".";
        b && (b = b.substr(0, b.length - 1));
        return a + b;
      },
      Pa = (a) => {
        if ("/" === a) return "/";
        a = J(a);
        a = a.replace(/\/$/, "");
        var b = a.lastIndexOf("/");
        return -1 === b ? a : a.substr(b + 1);
      };
    function Qa() {
      if (
        "object" == typeof crypto &&
        "function" == typeof crypto.getRandomValues
      ) {
        var a = new Uint8Array(1);
        return () => {
          crypto.getRandomValues(a);
          return a[0];
        };
      }
      return () => u("randomDevice");
    }
    function Ra() {
      for (var a = "", b = !1, c = arguments.length - 1; -1 <= c && !b; c--) {
        b = 0 <= c ? arguments[c] : "/";
        if ("string" != typeof b)
          throw new TypeError("Arguments to path.resolve must be strings");
        if (!b) return "";
        a = b + "/" + a;
        b = "/" === b.charAt(0);
      }
      a = Na(
        a.split("/").filter((d) => !!d),
        !b,
      ).join("/");
      return (b ? "/" : "") + a || ".";
    }
    function Sa(a, b) {
      var c = Array(ra(a) + 1);
      a = qa(a, c, 0, c.length);
      b && (c.length = a);
      return c;
    }
    var Ta = [];
    function Ua(a, b) {
      Ta[a] = { input: [], fa: [], Aa: b };
      Va(a, Wa);
    }
    var Wa = {
        open: function (a) {
          var b = Ta[a.node.Da];
          if (!b) throw new K(43);
          a.ea = b;
          a.seekable = !1;
        },
        close: function (a) {
          a.ea.Aa.Ha(a.ea);
        },
        Ha: function (a) {
          a.ea.Aa.Ha(a.ea);
        },
        read: function (a, b, c, d) {
          if (!a.ea || !a.ea.Aa.eb) throw new K(60);
          for (var e = 0, f = 0; f < d; f++) {
            try {
              var k = a.ea.Aa.eb(a.ea);
            } catch (l) {
              throw new K(29);
            }
            if (void 0 === k && 0 === e) throw new K(6);
            if (null === k || void 0 === k) break;
            e++;
            b[c + f] = k;
          }
          e && (a.node.timestamp = Date.now());
          return e;
        },
        write: function (a, b, c, d) {
          if (!a.ea || !a.ea.Aa.Ta) throw new K(60);
          try {
            for (var e = 0; e < d; e++) a.ea.Aa.Ta(a.ea, b[c + e]);
          } catch (f) {
            throw new K(29);
          }
          d && (a.node.timestamp = Date.now());
          return e;
        },
      },
      Xa = {
        eb: function (a) {
          if (!a.input.length) {
            var b = null;
            "undefined" != typeof window && "function" == typeof window.prompt
              ? ((b = window.prompt("Input: ")), null !== b && (b += "\n"))
              : "function" == typeof readline &&
                ((b = readline()), null !== b && (b += "\n"));
            if (!b) return null;
            a.input = Sa(b, !0);
          }
          return a.input.shift();
        },
        Ta: function (a, b) {
          null === b || 10 === b
            ? (ja(oa(a.fa)), (a.fa = []))
            : 0 != b && a.fa.push(b);
        },
        Ha: function (a) {
          a.fa && 0 < a.fa.length && (ja(oa(a.fa)), (a.fa = []));
        },
      },
      Ya = {
        Ta: function (a, b) {
          null === b || 10 === b
            ? (t(oa(a.fa)), (a.fa = []))
            : 0 != b && a.fa.push(b);
        },
        Ha: function (a) {
          a.fa && 0 < a.fa.length && (t(oa(a.fa)), (a.fa = []));
        },
      },
      L = {
        la: null,
        pa: function () {
          return L.createNode(null, "/", 16895, 0);
        },
        createNode: function (a, b, c, d) {
          if (24576 === (c & 61440) || 4096 === (c & 61440)) throw new K(63);
          L.la ||
            (L.la = {
              dir: {
                node: {
                  ka: L.Y.ka,
                  ma: L.Y.ma,
                  Ba: L.Y.Ba,
                  Ka: L.Y.Ka,
                  lb: L.Y.lb,
                  nb: L.Y.nb,
                  mb: L.Y.mb,
                  kb: L.Y.kb,
                  Ma: L.Y.Ma,
                },
                stream: { ta: L.$.ta },
              },
              file: {
                node: { ka: L.Y.ka, ma: L.Y.ma },
                stream: {
                  ta: L.$.ta,
                  read: L.$.read,
                  write: L.$.write,
                  Xa: L.$.Xa,
                  fb: L.$.fb,
                  hb: L.$.hb,
                },
              },
              link: {
                node: { ka: L.Y.ka, ma: L.Y.ma, Ea: L.Y.Ea },
                stream: {},
              },
              Za: { node: { ka: L.Y.ka, ma: L.Y.ma }, stream: Za },
            });
          c = $a(a, b, c, d);
          16384 === (c.mode & 61440)
            ? ((c.Y = L.la.dir.node), (c.$ = L.la.dir.stream), (c.Z = {}))
            : 32768 === (c.mode & 61440)
              ? ((c.Y = L.la.file.node),
                (c.$ = L.la.file.stream),
                (c.ca = 0),
                (c.Z = null))
              : 40960 === (c.mode & 61440)
                ? ((c.Y = L.la.link.node), (c.$ = L.la.link.stream))
                : 8192 === (c.mode & 61440) &&
                  ((c.Y = L.la.Za.node), (c.$ = L.la.Za.stream));
          c.timestamp = Date.now();
          a && ((a.Z[b] = c), (a.timestamp = c.timestamp));
          return c;
        },
        Ub: function (a) {
          return a.Z
            ? a.Z.subarray
              ? a.Z.subarray(0, a.ca)
              : new Uint8Array(a.Z)
            : new Uint8Array(0);
        },
        bb: function (a, b) {
          var c = a.Z ? a.Z.length : 0;
          c >= b ||
            ((b = Math.max(b, (c * (1048576 > c ? 2 : 1.125)) >>> 0)),
            0 != c && (b = Math.max(b, 256)),
            (c = a.Z),
            (a.Z = new Uint8Array(b)),
            0 < a.ca && a.Z.set(c.subarray(0, a.ca), 0));
        },
        Lb: function (a, b) {
          if (a.ca != b)
            if (0 == b) (a.Z = null), (a.ca = 0);
            else {
              var c = a.Z;
              a.Z = new Uint8Array(b);
              c && a.Z.set(c.subarray(0, Math.min(b, a.ca)));
              a.ca = b;
            }
        },
        Y: {
          ka: function (a) {
            var b = {};
            b.xb = 8192 === (a.mode & 61440) ? a.id : 1;
            b.Ra = a.id;
            b.mode = a.mode;
            b.Gb = 1;
            b.uid = 0;
            b.Bb = 0;
            b.Da = a.Da;
            16384 === (a.mode & 61440)
              ? (b.size = 4096)
              : 32768 === (a.mode & 61440)
                ? (b.size = a.ca)
                : 40960 === (a.mode & 61440)
                  ? (b.size = a.link.length)
                  : (b.size = 0);
            b.Ya = new Date(a.timestamp);
            b.ib = new Date(a.timestamp);
            b.$a = new Date(a.timestamp);
            b.tb = 4096;
            b.ub = Math.ceil(b.size / b.tb);
            return b;
          },
          ma: function (a, b) {
            void 0 !== b.mode && (a.mode = b.mode);
            void 0 !== b.timestamp && (a.timestamp = b.timestamp);
            void 0 !== b.size && L.Lb(a, b.size);
          },
          Ba: function () {
            throw ab[44];
          },
          Ka: function (a, b, c, d) {
            return L.createNode(a, b, c, d);
          },
          lb: function (a, b, c) {
            if (16384 === (a.mode & 61440)) {
              try {
                var d = bb(b, c);
              } catch (f) {}
              if (d) for (var e in d.Z) throw new K(55);
            }
            delete a.parent.Z[a.name];
            a.parent.timestamp = Date.now();
            a.name = c;
            b.Z[c] = a;
            b.timestamp = a.parent.timestamp;
            a.parent = b;
          },
          nb: function (a, b) {
            delete a.Z[b];
            a.timestamp = Date.now();
          },
          mb: function (a, b) {
            var c = bb(a, b),
              d;
            for (d in c.Z) throw new K(55);
            delete a.Z[b];
            a.timestamp = Date.now();
          },
          kb: function (a) {
            var b = [".", ".."],
              c;
            for (c in a.Z) a.Z.hasOwnProperty(c) && b.push(c);
            return b;
          },
          Ma: function (a, b, c) {
            a = L.createNode(a, b, 41471, 0);
            a.link = c;
            return a;
          },
          Ea: function (a) {
            if (40960 !== (a.mode & 61440)) throw new K(28);
            return a.link;
          },
        },
        $: {
          read: function (a, b, c, d, e) {
            var f = a.node.Z;
            if (e >= a.node.ca) return 0;
            a = Math.min(a.node.ca - e, d);
            if (8 < a && f.subarray) b.set(f.subarray(e, e + a), c);
            else for (d = 0; d < a; d++) b[c + d] = f[e + d];
            return a;
          },
          write: function (a, b, c, d, e, f) {
            b.buffer === y.buffer && (f = !1);
            if (!d) return 0;
            a = a.node;
            a.timestamp = Date.now();
            if (b.subarray && (!a.Z || a.Z.subarray)) {
              if (f) return (a.Z = b.subarray(c, c + d)), (a.ca = d);
              if (0 === a.ca && 0 === e)
                return (a.Z = b.slice(c, c + d)), (a.ca = d);
              if (e + d <= a.ca) return a.Z.set(b.subarray(c, c + d), e), d;
            }
            L.bb(a, e + d);
            if (a.Z.subarray && b.subarray) a.Z.set(b.subarray(c, c + d), e);
            else for (f = 0; f < d; f++) a.Z[e + f] = b[c + f];
            a.ca = Math.max(a.ca, e + d);
            return d;
          },
          ta: function (a, b, c) {
            1 === c
              ? (b += a.position)
              : 2 === c && 32768 === (a.node.mode & 61440) && (b += a.node.ca);
            if (0 > b) throw new K(28);
            return b;
          },
          Xa: function (a, b, c) {
            L.bb(a.node, b + c);
            a.node.ca = Math.max(a.node.ca, b + c);
          },
          fb: function (a, b, c, d, e) {
            if (32768 !== (a.node.mode & 61440)) throw new K(43);
            a = a.node.Z;
            if (e & 2 || a.buffer !== sa) {
              if (0 < c || c + b < a.length)
                a.subarray
                  ? (a = a.subarray(c, c + b))
                  : (a = Array.prototype.slice.call(a, c, c + b));
              c = !0;
              u();
              b = void 0;
              if (!b) throw new K(48);
              y.set(a, b);
            } else (c = !1), (b = a.byteOffset);
            return { aa: b, Tb: c };
          },
          hb: function (a, b, c, d) {
            L.$.write(a, b, 0, d, c, !1);
            return 0;
          },
        },
      },
      cb = null,
      db = {},
      eb = [],
      fb = 1,
      gb = null,
      hb = !0,
      K = null,
      ab = {},
      M = (a, b = {}) => {
        a = Ra("/", a);
        if (!a) return { path: "", node: null };
        b = Object.assign({ cb: !0, Ua: 0 }, b);
        if (8 < b.Ua) throw new K(32);
        a = Na(
          a.split("/").filter((k) => !!k),
          !1,
        );
        for (var c = cb, d = "/", e = 0; e < a.length; e++) {
          var f = e === a.length - 1;
          if (f && b.parent) break;
          c = bb(c, a[e]);
          d = J(d + "/" + a[e]);
          c.La && (!f || (f && b.cb)) && (c = c.La.root);
          if (!f || b.Pa)
            for (f = 0; 40960 === (c.mode & 61440); )
              if (
                ((c = ib(d)),
                (d = Ra(Oa(d), c)),
                (c = M(d, { Ua: b.Ua + 1 }).node),
                40 < f++)
              )
                throw new K(32);
        }
        return { path: d, node: c };
      },
      jb = (a) => {
        for (var b; ; ) {
          if (a === a.parent)
            return (
              (a = a.pa.gb),
              b ? ("/" !== a[a.length - 1] ? a + "/" + b : a + b) : a
            );
          b = b ? a.name + "/" + b : a.name;
          a = a.parent;
        }
      },
      kb = (a, b) => {
        for (var c = 0, d = 0; d < b.length; d++)
          c = ((c << 5) - c + b.charCodeAt(d)) | 0;
        return ((a + c) >>> 0) % gb.length;
      },
      bb = (a, b) => {
        var c;
        if ((c = (c = lb(a, "x")) ? c : a.Y.Ba ? 0 : 2)) throw new K(c, a);
        for (c = gb[kb(a.id, b)]; c; c = c.Fb) {
          var d = c.name;
          if (c.parent.id === a.id && d === b) return c;
        }
        return a.Y.Ba(a, b);
      },
      $a = (a, b, c, d) => {
        a = new mb(a, b, c, d);
        b = kb(a.parent.id, a.name);
        a.Fb = gb[b];
        return (gb[b] = a);
      },
      nb = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 },
      ob = (a) => {
        var b = ["r", "w", "rw"][a & 3];
        a & 512 && (b += "w");
        return b;
      },
      lb = (a, b) => {
        if (hb) return 0;
        if (!b.includes("r") || a.mode & 292) {
          if (
            (b.includes("w") && !(a.mode & 146)) ||
            (b.includes("x") && !(a.mode & 73))
          )
            return 2;
        } else return 2;
        return 0;
      },
      pb = (a, b) => {
        try {
          return bb(a, b), 20;
        } catch (c) {}
        return lb(a, "wx");
      },
      qb = (a = 0) => {
        for (; 4096 >= a; a++) if (!eb[a]) return a;
        throw new K(33);
      },
      sb = (a, b) => {
        rb ||
          ((rb = function () {
            this.xa = {};
          }),
          (rb.prototype = {}),
          Object.defineProperties(rb.prototype, {
            object: {
              get: function () {
                return this.node;
              },
              set: function (c) {
                this.node = c;
              },
            },
            flags: {
              get: function () {
                return this.xa.flags;
              },
              set: function (c) {
                this.xa.flags = c;
              },
            },
            position: {
              get: function () {
                return this.xa.position;
              },
              set: function (c) {
                this.xa.position = c;
              },
            },
          }));
        a = Object.assign(new rb(), a);
        b = qb(b);
        a.ra = b;
        return (eb[b] = a);
      },
      Za = {
        open: (a) => {
          a.$ = db[a.node.Da].$;
          a.$.open && a.$.open(a);
        },
        ta: () => {
          throw new K(70);
        },
      },
      Va = (a, b) => {
        db[a] = { $: b };
      },
      tb = (a, b) => {
        var c = "/" === b,
          d = !b;
        if (c && cb) throw new K(10);
        if (!c && !d) {
          var e = M(b, { cb: !1 });
          b = e.path;
          e = e.node;
          if (e.La) throw new K(10);
          if (16384 !== (e.mode & 61440)) throw new K(54);
        }
        b = { type: a, Xb: {}, gb: b, Eb: [] };
        a = a.pa(b);
        a.pa = b;
        b.root = a;
        c ? (cb = a) : e && ((e.La = b), e.pa && e.pa.Eb.push(b));
      },
      N = (a, b, c) => {
        var d = M(a, { parent: !0 }).node;
        a = Pa(a);
        if (!a || "." === a || ".." === a) throw new K(28);
        var e = pb(d, a);
        if (e) throw new K(e);
        if (!d.Y.Ka) throw new K(63);
        return d.Y.Ka(d, a, b, c);
      },
      ub = (a, b, c) => {
        "undefined" == typeof c && ((c = b), (b = 438));
        N(a, b | 8192, c);
      },
      vb = (a, b) => {
        if (!Ra(a)) throw new K(44);
        var c = M(b, { parent: !0 }).node;
        if (!c) throw new K(44);
        b = Pa(b);
        var d = pb(c, b);
        if (d) throw new K(d);
        if (!c.Y.Ma) throw new K(63);
        c.Y.Ma(c, b, a);
      },
      ib = (a) => {
        a = M(a).node;
        if (!a) throw new K(44);
        if (!a.Y.Ea) throw new K(28);
        return Ra(jb(a.parent), a.Y.Ea(a));
      },
      xb = (a, b, c) => {
        if ("" === a) throw new K(44);
        if ("string" == typeof b) {
          var d = nb[b];
          if ("undefined" == typeof d)
            throw Error("Unknown file open mode: " + b);
          b = d;
        }
        c = b & 64 ? (("undefined" == typeof c ? 438 : c) & 4095) | 32768 : 0;
        if ("object" == typeof a) var e = a;
        else {
          a = J(a);
          try {
            e = M(a, { Pa: !(b & 131072) }).node;
          } catch (f) {}
        }
        d = !1;
        if (b & 64)
          if (e) {
            if (b & 128) throw new K(20);
          } else (e = N(a, c, 0)), (d = !0);
        if (!e) throw new K(44);
        8192 === (e.mode & 61440) && (b &= -513);
        if (b & 65536 && 16384 !== (e.mode & 61440)) throw new K(54);
        if (
          !d &&
          (c = e
            ? 40960 === (e.mode & 61440)
              ? 32
              : 16384 === (e.mode & 61440) && ("r" !== ob(b) || b & 512)
                ? 31
                : lb(e, ob(b))
            : 44)
        )
          throw new K(c);
        if (b & 512 && !d) {
          c = e;
          c = "string" == typeof c ? M(c, { Pa: !0 }).node : c;
          if (!c.Y.ma) throw new K(63);
          if (16384 === (c.mode & 61440)) throw new K(31);
          if (32768 !== (c.mode & 61440)) throw new K(28);
          if ((d = lb(c, "w"))) throw new K(d);
          c.Y.ma(c, { size: 0, timestamp: Date.now() });
        }
        b &= -131713;
        e = sb({
          node: e,
          path: jb(e),
          flags: b,
          seekable: !0,
          position: 0,
          $: e.$,
          Sb: [],
          error: !1,
        });
        e.$.open && e.$.open(e);
        !g.logReadFiles || b & 1 || (wb || (wb = {}), a in wb || (wb[a] = 1));
        return e;
      },
      yb = (a, b, c) => {
        if (null === a.ra) throw new K(8);
        if (!a.seekable || !a.$.ta) throw new K(70);
        if (0 != c && 1 != c && 2 != c) throw new K(28);
        a.position = a.$.ta(a, b, c);
        a.Sb = [];
      },
      zb = () => {
        K ||
          ((K = function (a, b) {
            this.node = b;
            this.Mb = function (c) {
              this.qa = c;
            };
            this.Mb(a);
            this.message = "FS error";
          }),
          (K.prototype = Error()),
          (K.prototype.constructor = K),
          [44].forEach((a) => {
            ab[a] = new K(a);
            ab[a].stack = "<generic error, no stack>";
          }));
      },
      Ab,
      Bb = (a, b) => {
        var c = 0;
        a && (c |= 365);
        b && (c |= 146);
        return c;
      },
      Db = (a, b, c) => {
        a = J("/dev/" + a);
        var d = Bb(!!b, !!c);
        Cb || (Cb = 64);
        var e = (Cb++ << 8) | 0;
        Va(e, {
          open: (f) => {
            f.seekable = !1;
          },
          close: () => {
            c && c.buffer && c.buffer.length && c(10);
          },
          read: (f, k, l, n) => {
            for (var p = 0, q = 0; q < n; q++) {
              try {
                var v = b();
              } catch (z) {
                throw new K(29);
              }
              if (void 0 === v && 0 === p) throw new K(6);
              if (null === v || void 0 === v) break;
              p++;
              k[l + q] = v;
            }
            p && (f.node.timestamp = Date.now());
            return p;
          },
          write: (f, k, l, n) => {
            for (var p = 0; p < n; p++)
              try {
                c(k[l + p]);
              } catch (q) {
                throw new K(29);
              }
            n && (f.node.timestamp = Date.now());
            return p;
          },
        });
        ub(a, d, e);
      },
      Cb,
      O = {},
      rb,
      wb,
      Eb = void 0;
    function P() {
      Eb += 4;
      return C[(Eb - 4) >> 2];
    }
    function Q(a) {
      a = eb[a];
      if (!a) throw new K(8);
      return a;
    }
    function Fb(a) {
      switch (a) {
        case 1:
          return 0;
        case 2:
          return 1;
        case 4:
          return 2;
        case 8:
          return 3;
        default:
          throw new TypeError("Unknown type size: " + a);
      }
    }
    var Gb = void 0;
    function R(a) {
      for (var b = ""; w[a]; ) b += Gb[w[a++]];
      return b;
    }
    var Hb = {},
      S = {},
      Ib = {};
    function Jb(a) {
      if (void 0 === a) return "_unknown";
      a = a.replace(/[^a-zA-Z0-9_]/g, "$");
      var b = a.charCodeAt(0);
      return 48 <= b && 57 >= b ? "_" + a : a;
    }
    function Kb(a, b) {
      a = Jb(a);
      return new Function(
        "body",
        "return function " +
          a +
          '() {\n    "use strict";    return body.apply(this, arguments);\n};\n',
      )(b);
    }
    function Lb(a) {
      var b = Error,
        c = Kb(a, function (d) {
          this.name = a;
          this.message = d;
          d = Error(d).stack;
          void 0 !== d &&
            (this.stack =
              this.toString() + "\n" + d.replace(/^Error(:[^\n]*)?\n/, ""));
        });
      c.prototype = Object.create(b.prototype);
      c.prototype.constructor = c;
      c.prototype.toString = function () {
        return void 0 === this.message
          ? this.name
          : this.name + ": " + this.message;
      };
      return c;
    }
    var Mb = void 0;
    function T(a) {
      throw new Mb(a);
    }
    var Nb = void 0;
    function Ob(a) {
      throw new Nb(a);
    }
    function Pb(a, b, c) {
      function d(l) {
        l = c(l);
        l.length !== a.length && Ob("Mismatched type converter count");
        for (var n = 0; n < a.length; ++n) U(a[n], l[n]);
      }
      a.forEach(function (l) {
        Ib[l] = b;
      });
      var e = Array(b.length),
        f = [],
        k = 0;
      b.forEach((l, n) => {
        S.hasOwnProperty(l)
          ? (e[n] = S[l])
          : (f.push(l),
            Hb.hasOwnProperty(l) || (Hb[l] = []),
            Hb[l].push(() => {
              e[n] = S[l];
              ++k;
              k === f.length && d(e);
            }));
      });
      0 === f.length && d(e);
    }
    function U(a, b, c = {}) {
      if (!("argPackAdvance" in b))
        throw new TypeError(
          "registerType registeredInstance requires argPackAdvance",
        );
      var d = b.name;
      a || T('type "' + d + '" must have a positive integer typeid pointer');
      if (S.hasOwnProperty(a)) {
        if (c.Cb) return;
        T("Cannot register type '" + d + "' twice");
      }
      S[a] = b;
      delete Ib[a];
      Hb.hasOwnProperty(a) &&
        ((b = Hb[a]), delete Hb[a], b.forEach((e) => e()));
    }
    function Qb(a) {
      T(a.X.da.ba.name + " instance already deleted");
    }
    var Rb = !1;
    function Sb() {}
    function Tb(a) {
      --a.count.value;
      0 === a.count.value && (a.ha ? a.ia.ua(a.ha) : a.da.ba.ua(a.aa));
    }
    function Ub(a, b, c) {
      if (b === c) return a;
      if (void 0 === c.ja) return null;
      a = Ub(a, b, c.ja);
      return null === a ? null : c.yb(a);
    }
    var Vb = {},
      Wb = [];
    function Xb() {
      for (; Wb.length; ) {
        var a = Wb.pop();
        a.X.ya = !1;
        a["delete"]();
      }
    }
    var Yb = void 0,
      Zb = {};
    function $b(a, b) {
      for (void 0 === b && T("ptr should not be undefined"); a.ja; )
        (b = a.Fa(b)), (a = a.ja);
      return Zb[b];
    }
    function ac(a, b) {
      (b.da && b.aa) || Ob("makeClassHandle requires ptr and ptrType");
      !!b.ia !== !!b.ha &&
        Ob("Both smartPtrType and smartPtr must be specified");
      b.count = { value: 1 };
      return bc(Object.create(a, { X: { value: b } }));
    }
    function bc(a) {
      if ("undefined" === typeof FinalizationRegistry)
        return (bc = (b) => b), a;
      Rb = new FinalizationRegistry((b) => {
        Tb(b.X);
      });
      bc = (b) => {
        var c = b.X;
        c.ha && Rb.register(b, { X: c }, b);
        return b;
      };
      Sb = (b) => {
        Rb.unregister(b);
      };
      return bc(a);
    }
    function V() {}
    function cc(a, b, c) {
      if (void 0 === a[b].ga) {
        var d = a[b];
        a[b] = function () {
          a[b].ga.hasOwnProperty(arguments.length) ||
            T(
              "Function '" +
                c +
                "' called with an invalid number of arguments (" +
                arguments.length +
                ") - expects one of (" +
                a[b].ga +
                ")!",
            );
          return a[b].ga[arguments.length].apply(this, arguments);
        };
        a[b].ga = [];
        a[b].ga[d.Ga] = d;
      }
    }
    function dc(a, b, c) {
      g.hasOwnProperty(a)
        ? ((void 0 === c || (void 0 !== g[a].ga && void 0 !== g[a].ga[c])) &&
            T("Cannot register public name '" + a + "' twice"),
          cc(g, a, a),
          g.hasOwnProperty(c) &&
            T(
              "Cannot register multiple overloads of a function with the same number of arguments (" +
                c +
                ")!",
            ),
          (g[a].ga[c] = b))
        : ((g[a] = b), void 0 !== c && (g[a].Wb = c));
    }
    function ec(a, b, c, d, e, f, k, l) {
      this.name = a;
      this.constructor = b;
      this.za = c;
      this.ua = d;
      this.ja = e;
      this.zb = f;
      this.Fa = k;
      this.yb = l;
      this.Ib = [];
    }
    function fc(a, b, c) {
      for (; b !== c; )
        b.Fa ||
          T(
            "Expected null or instance of " +
              c.name +
              ", got an instance of " +
              b.name,
          ),
          (a = b.Fa(a)),
          (b = b.ja);
      return a;
    }
    function gc(a, b) {
      if (null === b)
        return this.Sa && T("null is not a valid " + this.name), 0;
      b.X || T('Cannot pass "' + hc(b) + '" as a ' + this.name);
      b.X.aa ||
        T("Cannot pass deleted object as a pointer of type " + this.name);
      return fc(b.X.aa, b.X.da.ba, this.ba);
    }
    function ic(a, b) {
      if (null === b) {
        this.Sa && T("null is not a valid " + this.name);
        if (this.Ja) {
          var c = this.Jb();
          null !== a && a.push(this.ua, c);
          return c;
        }
        return 0;
      }
      b.X || T('Cannot pass "' + hc(b) + '" as a ' + this.name);
      b.X.aa ||
        T("Cannot pass deleted object as a pointer of type " + this.name);
      !this.Ia &&
        b.X.da.Ia &&
        T(
          "Cannot convert argument of type " +
            (b.X.ia ? b.X.ia.name : b.X.da.name) +
            " to parameter type " +
            this.name,
        );
      c = fc(b.X.aa, b.X.da.ba, this.ba);
      if (this.Ja)
        switch (
          (void 0 === b.X.ha &&
            T("Passing raw pointer to smart pointer is illegal"),
          this.Nb)
        ) {
          case 0:
            b.X.ia === this
              ? (c = b.X.ha)
              : T(
                  "Cannot convert argument of type " +
                    (b.X.ia ? b.X.ia.name : b.X.da.name) +
                    " to parameter type " +
                    this.name,
                );
            break;
          case 1:
            c = b.X.ha;
            break;
          case 2:
            if (b.X.ia === this) c = b.X.ha;
            else {
              var d = b.clone();
              c = this.Kb(
                c,
                jc(function () {
                  d["delete"]();
                }),
              );
              null !== a && a.push(this.ua, c);
            }
            break;
          default:
            T("Unsupporting sharing policy");
        }
      return c;
    }
    function kc(a, b) {
      if (null === b)
        return this.Sa && T("null is not a valid " + this.name), 0;
      b.X || T('Cannot pass "' + hc(b) + '" as a ' + this.name);
      b.X.aa ||
        T("Cannot pass deleted object as a pointer of type " + this.name);
      b.X.da.Ia &&
        T(
          "Cannot convert argument of type " +
            b.X.da.name +
            " to parameter type " +
            this.name,
        );
      return fc(b.X.aa, b.X.da.ba, this.ba);
    }
    function lc(a) {
      return this.fromWireType(C[a >> 2]);
    }
    function W(a, b, c, d) {
      this.name = a;
      this.ba = b;
      this.Sa = c;
      this.Ia = d;
      this.Ja = !1;
      this.ua = this.Kb = this.Jb = this.jb = this.Nb = this.Hb = void 0;
      void 0 !== b.ja
        ? (this.toWireType = ic)
        : ((this.toWireType = d ? gc : kc), (this.oa = null));
    }
    function mc(a, b, c) {
      g.hasOwnProperty(a) || Ob("Replacing nonexistant public symbol");
      void 0 !== g[a].ga && void 0 !== c
        ? (g[a].ga[c] = b)
        : ((g[a] = b), (g[a].Ga = c));
    }
    var nc = [];
    function qc(a) {
      var b = nc[a];
      b || (a >= nc.length && (nc.length = a + 1), (nc[a] = b = xa.get(a)));
      return b;
    }
    function rc(a, b) {
      var c = [];
      return function () {
        c.length = 0;
        Object.assign(c, arguments);
        if (a.includes("j")) {
          var d = g["dynCall_" + a];
          d = c && c.length ? d.apply(null, [b].concat(c)) : d.call(null, b);
        } else d = qc(b).apply(null, c);
        return d;
      };
    }
    function X(a, b) {
      a = R(a);
      var c = a.includes("j") ? rc(a, b) : qc(b);
      "function" != typeof c &&
        T("unknown function pointer with signature " + a + ": " + b);
      return c;
    }
    var sc = void 0;
    function tc(a) {
      a = uc(a);
      var b = R(a);
      Y(a);
      return b;
    }
    function vc(a, b) {
      function c(f) {
        e[f] || S[f] || (Ib[f] ? Ib[f].forEach(c) : (d.push(f), (e[f] = !0)));
      }
      var d = [],
        e = {};
      b.forEach(c);
      throw new sc(a + ": " + d.map(tc).join([", "]));
    }
    function wc(a, b) {
      for (var c = [], d = 0; d < a; d++) c.push(D[(b + 4 * d) >> 2]);
      return c;
    }
    function xc(a) {
      for (; a.length; ) {
        var b = a.pop();
        a.pop()(b);
      }
    }
    function yc(a) {
      var b = Function;
      if (!(b instanceof Function))
        throw new TypeError(
          "new_ called with constructor type " +
            typeof b +
            " which is not a function",
        );
      var c = Kb(b.name || "unknownFunctionName", function () {});
      c.prototype = b.prototype;
      c = new c();
      a = b.apply(c, a);
      return a instanceof Object ? a : c;
    }
    function zc(a, b, c, d, e) {
      var f = b.length;
      2 > f &&
        T(
          "argTypes array size mismatch! Must at least get return value and 'this' types!",
        );
      var k = null !== b[1] && null !== c,
        l = !1;
      for (c = 1; c < b.length; ++c)
        if (null !== b[c] && void 0 === b[c].oa) {
          l = !0;
          break;
        }
      var n = "void" !== b[0].name,
        p = "",
        q = "";
      for (c = 0; c < f - 2; ++c)
        (p += (0 !== c ? ", " : "") + "arg" + c),
          (q += (0 !== c ? ", " : "") + "arg" + c + "Wired");
      a =
        "return function " +
        Jb(a) +
        "(" +
        p +
        ") {\nif (arguments.length !== " +
        (f - 2) +
        ") {\nthrowBindingError('function " +
        a +
        " called with ' + arguments.length + ' arguments, expected " +
        (f - 2) +
        " args!');\n}\n";
      l && (a += "var destructors = [];\n");
      var v = l ? "destructors" : "null";
      p =
        "throwBindingError invoker fn runDestructors retType classParam".split(
          " ",
        );
      d = [T, d, e, xc, b[0], b[1]];
      k && (a += "var thisWired = classParam.toWireType(" + v + ", this);\n");
      for (c = 0; c < f - 2; ++c)
        (a +=
          "var arg" +
          c +
          "Wired = argType" +
          c +
          ".toWireType(" +
          v +
          ", arg" +
          c +
          "); // " +
          b[c + 2].name +
          "\n"),
          p.push("argType" + c),
          d.push(b[c + 2]);
      k && (q = "thisWired" + (0 < q.length ? ", " : "") + q);
      a +=
        (n ? "var rv = " : "") +
        "invoker(fn" +
        (0 < q.length ? ", " : "") +
        q +
        ");\n";
      if (l) a += "runDestructors(destructors);\n";
      else
        for (c = k ? 1 : 2; c < b.length; ++c)
          (f = 1 === c ? "thisWired" : "arg" + (c - 2) + "Wired"),
            null !== b[c].oa &&
              ((a += f + "_dtor(" + f + "); // " + b[c].name + "\n"),
              p.push(f + "_dtor"),
              d.push(b[c].oa));
      n && (a += "var ret = retType.fromWireType(rv);\nreturn ret;\n");
      p.push(a + "}\n");
      return yc(p).apply(null, d);
    }
    var Ac = [],
      Z = [
        {},
        { value: void 0 },
        { value: null },
        { value: !0 },
        { value: !1 },
      ];
    function Bc(a) {
      4 < a && 0 === --Z[a].Va && ((Z[a] = void 0), Ac.push(a));
    }
    var jc = (a) => {
      switch (a) {
        case void 0:
          return 1;
        case null:
          return 2;
        case !0:
          return 3;
        case !1:
          return 4;
        default:
          var b = Ac.length ? Ac.pop() : Z.length;
          Z[b] = { Va: 1, value: a };
          return b;
      }
    };
    function hc(a) {
      if (null === a) return "null";
      var b = typeof a;
      return "object" === b || "array" === b || "function" === b
        ? a.toString()
        : "" + a;
    }
    function Cc(a, b) {
      switch (b) {
        case 2:
          return function (c) {
            return this.fromWireType(ua[c >> 2]);
          };
        case 3:
          return function (c) {
            return this.fromWireType(va[c >> 3]);
          };
        default:
          throw new TypeError("Unknown float type: " + a);
      }
    }
    function Dc(a, b, c) {
      switch (b) {
        case 0:
          return c
            ? function (d) {
                return y[d];
              }
            : function (d) {
                return w[d];
              };
        case 1:
          return c
            ? function (d) {
                return A[d >> 1];
              }
            : function (d) {
                return ta[d >> 1];
              };
        case 2:
          return c
            ? function (d) {
                return C[d >> 2];
              }
            : function (d) {
                return D[d >> 2];
              };
        default:
          throw new TypeError("Unknown integer type: " + a);
      }
    }
    var Ec = new TextDecoder("utf-16le");
    function Fc(a, b) {
      var c = a >> 1;
      for (b = c + b / 2; !(c >= b) && ta[c]; ) ++c;
      return Ec.decode(w.subarray(a, c << 1));
    }
    function Gc(a, b, c) {
      void 0 === c && (c = 2147483647);
      if (2 > c) return 0;
      c -= 2;
      var d = b;
      c = c < 2 * a.length ? c / 2 : a.length;
      for (var e = 0; e < c; ++e) (A[b >> 1] = a.charCodeAt(e)), (b += 2);
      A[b >> 1] = 0;
      return b - d;
    }
    function Hc(a) {
      return 2 * a.length;
    }
    function Ic(a, b) {
      for (var c = 0, d = ""; !(c >= b / 4); ) {
        var e = C[(a + 4 * c) >> 2];
        if (0 == e) break;
        ++c;
        65536 <= e
          ? ((e -= 65536),
            (d += String.fromCharCode(55296 | (e >> 10), 56320 | (e & 1023))))
          : (d += String.fromCharCode(e));
      }
      return d;
    }
    function Jc(a, b, c) {
      void 0 === c && (c = 2147483647);
      if (4 > c) return 0;
      var d = b;
      c = d + c - 4;
      for (var e = 0; e < a.length; ++e) {
        var f = a.charCodeAt(e);
        if (55296 <= f && 57343 >= f) {
          var k = a.charCodeAt(++e);
          f = (65536 + ((f & 1023) << 10)) | (k & 1023);
        }
        C[b >> 2] = f;
        b += 4;
        if (b + 4 > c) break;
      }
      C[b >> 2] = 0;
      return b - d;
    }
    function Kc(a) {
      for (var b = 0, c = 0; c < a.length; ++c) {
        var d = a.charCodeAt(c);
        55296 <= d && 57343 >= d && ++c;
        b += 4;
      }
      return b;
    }
    var Lc = {};
    function Mc() {
      if (!Nc) {
        var a = {
            USER: "web_user",
            LOGNAME: "web_user",
            PATH: "/",
            PWD: "/",
            HOME: "/home/web_user",
            LANG:
              (
                ("object" == typeof navigator &&
                  navigator.languages &&
                  navigator.languages[0]) ||
                "C"
              ).replace("-", "_") + ".UTF-8",
            _: fa || "./this.program",
          },
          b;
        for (b in Lc) void 0 === Lc[b] ? delete a[b] : (a[b] = Lc[b]);
        var c = [];
        for (b in a) c.push(b + "=" + a[b]);
        Nc = c;
      }
      return Nc;
    }
    var Nc;
    function Oc(a) {
      return 0 === a % 4 && (0 !== a % 100 || 0 === a % 400);
    }
    var Pc = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      Qc = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function Rc(a, b, c, d) {
      function e(h, r, x) {
        for (h = "number" == typeof h ? h.toString() : h || ""; h.length < r; )
          h = x[0] + h;
        return h;
      }
      function f(h, r) {
        return e(h, r, "0");
      }
      function k(h, r) {
        function x(E) {
          return 0 > E ? -1 : 0 < E ? 1 : 0;
        }
        var B;
        0 === (B = x(h.getFullYear() - r.getFullYear())) &&
          0 === (B = x(h.getMonth() - r.getMonth())) &&
          (B = x(h.getDate() - r.getDate()));
        return B;
      }
      function l(h) {
        switch (h.getDay()) {
          case 0:
            return new Date(h.getFullYear() - 1, 11, 29);
          case 1:
            return h;
          case 2:
            return new Date(h.getFullYear(), 0, 3);
          case 3:
            return new Date(h.getFullYear(), 0, 2);
          case 4:
            return new Date(h.getFullYear(), 0, 1);
          case 5:
            return new Date(h.getFullYear() - 1, 11, 31);
          case 6:
            return new Date(h.getFullYear() - 1, 11, 30);
        }
      }
      function n(h) {
        var r = h.va;
        for (h = new Date(new Date(h.wa + 1900, 0, 1).getTime()); 0 < r; ) {
          var x = h.getMonth(),
            B = (Oc(h.getFullYear()) ? Pc : Qc)[x];
          if (r > B - h.getDate())
            (r -= B - h.getDate() + 1),
              h.setDate(1),
              11 > x
                ? h.setMonth(x + 1)
                : (h.setMonth(0), h.setFullYear(h.getFullYear() + 1));
          else {
            h.setDate(h.getDate() + r);
            break;
          }
        }
        x = new Date(h.getFullYear() + 1, 0, 4);
        r = l(new Date(h.getFullYear(), 0, 4));
        x = l(x);
        return 0 >= k(r, h)
          ? 0 >= k(x, h)
            ? h.getFullYear() + 1
            : h.getFullYear()
          : h.getFullYear() - 1;
      }
      var p = C[(d + 40) >> 2];
      d = {
        Qb: C[d >> 2],
        Pb: C[(d + 4) >> 2],
        Na: C[(d + 8) >> 2],
        Wa: C[(d + 12) >> 2],
        Oa: C[(d + 16) >> 2],
        wa: C[(d + 20) >> 2],
        na: C[(d + 24) >> 2],
        va: C[(d + 28) >> 2],
        Yb: C[(d + 32) >> 2],
        Ob: C[(d + 36) >> 2],
        Rb: p ? pa(p) : "",
      };
      c = pa(c);
      p = {
        "%c": "%a %b %d %H:%M:%S %Y",
        "%D": "%m/%d/%y",
        "%F": "%Y-%m-%d",
        "%h": "%b",
        "%r": "%I:%M:%S %p",
        "%R": "%H:%M",
        "%T": "%H:%M:%S",
        "%x": "%m/%d/%y",
        "%X": "%H:%M:%S",
        "%Ec": "%c",
        "%EC": "%C",
        "%Ex": "%m/%d/%y",
        "%EX": "%H:%M:%S",
        "%Ey": "%y",
        "%EY": "%Y",
        "%Od": "%d",
        "%Oe": "%e",
        "%OH": "%H",
        "%OI": "%I",
        "%Om": "%m",
        "%OM": "%M",
        "%OS": "%S",
        "%Ou": "%u",
        "%OU": "%U",
        "%OV": "%V",
        "%Ow": "%w",
        "%OW": "%W",
        "%Oy": "%y",
      };
      for (var q in p) c = c.replace(new RegExp(q, "g"), p[q]);
      var v = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(
          " ",
        ),
        z =
          "January February March April May June July August September October November December".split(
            " ",
          );
      p = {
        "%a": function (h) {
          return v[h.na].substring(0, 3);
        },
        "%A": function (h) {
          return v[h.na];
        },
        "%b": function (h) {
          return z[h.Oa].substring(0, 3);
        },
        "%B": function (h) {
          return z[h.Oa];
        },
        "%C": function (h) {
          return f(((h.wa + 1900) / 100) | 0, 2);
        },
        "%d": function (h) {
          return f(h.Wa, 2);
        },
        "%e": function (h) {
          return e(h.Wa, 2, " ");
        },
        "%g": function (h) {
          return n(h).toString().substring(2);
        },
        "%G": function (h) {
          return n(h);
        },
        "%H": function (h) {
          return f(h.Na, 2);
        },
        "%I": function (h) {
          h = h.Na;
          0 == h ? (h = 12) : 12 < h && (h -= 12);
          return f(h, 2);
        },
        "%j": function (h) {
          for (
            var r = 0, x = 0;
            x <= h.Oa - 1;
            r += (Oc(h.wa + 1900) ? Pc : Qc)[x++]
          );
          return f(h.Wa + r, 3);
        },
        "%m": function (h) {
          return f(h.Oa + 1, 2);
        },
        "%M": function (h) {
          return f(h.Pb, 2);
        },
        "%n": function () {
          return "\n";
        },
        "%p": function (h) {
          return 0 <= h.Na && 12 > h.Na ? "AM" : "PM";
        },
        "%S": function (h) {
          return f(h.Qb, 2);
        },
        "%t": function () {
          return "\t";
        },
        "%u": function (h) {
          return h.na || 7;
        },
        "%U": function (h) {
          return f(Math.floor((h.va + 7 - h.na) / 7), 2);
        },
        "%V": function (h) {
          var r = Math.floor((h.va + 7 - ((h.na + 6) % 7)) / 7);
          2 >= (h.na + 371 - h.va - 2) % 7 && r++;
          if (r)
            53 == r &&
              ((x = (h.na + 371 - h.va) % 7),
              4 == x || (3 == x && Oc(h.wa)) || (r = 1));
          else {
            r = 52;
            var x = (h.na + 7 - h.va - 1) % 7;
            (4 == x || (5 == x && Oc((h.wa % 400) - 1))) && r++;
          }
          return f(r, 2);
        },
        "%w": function (h) {
          return h.na;
        },
        "%W": function (h) {
          return f(Math.floor((h.va + 7 - ((h.na + 6) % 7)) / 7), 2);
        },
        "%y": function (h) {
          return (h.wa + 1900).toString().substring(2);
        },
        "%Y": function (h) {
          return h.wa + 1900;
        },
        "%z": function (h) {
          h = h.Ob;
          var r = 0 <= h;
          h = Math.abs(h) / 60;
          return (
            (r ? "+" : "-") +
            String("0000" + ((h / 60) * 100 + (h % 60))).slice(-4)
          );
        },
        "%Z": function (h) {
          return h.Rb;
        },
        "%%": function () {
          return "%";
        },
      };
      c = c.replace(/%%/g, "\x00\x00");
      for (q in p)
        c.includes(q) && (c = c.replace(new RegExp(q, "g"), p[q](d)));
      c = c.replace(/\0\0/g, "%");
      q = Sa(c, !1);
      if (q.length > b) return 0;
      y.set(q, a);
      return q.length - 1;
    }
    function Sc(a) {
      if (!noExitRuntime) {
        if (g.onExit) g.onExit(a);
        ma = !0;
      }
      ha(a, new Ja(a));
    }
    function mb(a, b, c, d) {
      a || (a = this);
      this.parent = a;
      this.pa = a.pa;
      this.La = null;
      this.id = fb++;
      this.name = b;
      this.mode = c;
      this.Y = {};
      this.$ = {};
      this.Da = d;
    }
    Object.defineProperties(mb.prototype, {
      read: {
        get: function () {
          return 365 === (this.mode & 365);
        },
        set: function (a) {
          a ? (this.mode |= 365) : (this.mode &= -366);
        },
      },
      write: {
        get: function () {
          return 146 === (this.mode & 146);
        },
        set: function (a) {
          a ? (this.mode |= 146) : (this.mode &= -147);
        },
      },
    });
    zb();
    gb = Array(4096);
    tb(L, "/");
    N("/tmp", 16895, 0);
    N("/home", 16895, 0);
    N("/home/web_user", 16895, 0);
    (() => {
      N("/dev", 16895, 0);
      Va(259, { read: () => 0, write: (b, c, d, e) => e });
      ub("/dev/null", 259);
      Ua(1280, Xa);
      Ua(1536, Ya);
      ub("/dev/tty", 1280);
      ub("/dev/tty1", 1536);
      var a = Qa();
      Db("random", a);
      Db("urandom", a);
      N("/dev/shm", 16895, 0);
      N("/dev/shm/tmp", 16895, 0);
    })();
    (() => {
      N("/proc", 16895, 0);
      var a = N("/proc/self", 16895, 0);
      N("/proc/self/fd", 16895, 0);
      tb(
        {
          pa: () => {
            var b = $a(a, "fd", 16895, 73);
            b.Y = {
              Ba: (c, d) => {
                var e = eb[+d];
                if (!e) throw new K(8);
                c = {
                  parent: null,
                  pa: { gb: "fake" },
                  Y: { Ea: () => e.path },
                };
                return (c.parent = c);
              },
            };
            return b;
          },
        },
        "/proc/self/fd",
      );
    })();
    for (var Tc = Array(256), Uc = 0; 256 > Uc; ++Uc)
      Tc[Uc] = String.fromCharCode(Uc);
    Gb = Tc;
    Mb = g.BindingError = Lb("BindingError");
    Nb = g.InternalError = Lb("InternalError");
    V.prototype.isAliasOf = function (a) {
      if (!(this instanceof V && a instanceof V)) return !1;
      var b = this.X.da.ba,
        c = this.X.aa,
        d = a.X.da.ba;
      for (a = a.X.aa; b.ja; ) (c = b.Fa(c)), (b = b.ja);
      for (; d.ja; ) (a = d.Fa(a)), (d = d.ja);
      return b === d && c === a;
    };
    V.prototype.clone = function () {
      this.X.aa || Qb(this);
      if (this.X.Ca) return (this.X.count.value += 1), this;
      var a = bc,
        b = Object,
        c = b.create,
        d = Object.getPrototypeOf(this),
        e = this.X;
      a = a(
        c.call(b, d, {
          X: {
            value: {
              count: e.count,
              ya: e.ya,
              Ca: e.Ca,
              aa: e.aa,
              da: e.da,
              ha: e.ha,
              ia: e.ia,
            },
          },
        }),
      );
      a.X.count.value += 1;
      a.X.ya = !1;
      return a;
    };
    V.prototype["delete"] = function () {
      this.X.aa || Qb(this);
      this.X.ya && !this.X.Ca && T("Object already scheduled for deletion");
      Sb(this);
      Tb(this.X);
      this.X.Ca || ((this.X.ha = void 0), (this.X.aa = void 0));
    };
    V.prototype.isDeleted = function () {
      return !this.X.aa;
    };
    V.prototype.deleteLater = function () {
      this.X.aa || Qb(this);
      this.X.ya && !this.X.Ca && T("Object already scheduled for deletion");
      Wb.push(this);
      1 === Wb.length && Yb && Yb(Xb);
      this.X.ya = !0;
      return this;
    };
    g.getInheritedInstanceCount = function () {
      return Object.keys(Zb).length;
    };
    g.getLiveInheritedInstances = function () {
      var a = [],
        b;
      for (b in Zb) Zb.hasOwnProperty(b) && a.push(Zb[b]);
      return a;
    };
    g.flushPendingDeletes = Xb;
    g.setDelayFunction = function (a) {
      Yb = a;
      Wb.length && Yb && Yb(Xb);
    };
    W.prototype.Ab = function (a) {
      this.jb && (a = this.jb(a));
      return a;
    };
    W.prototype.ab = function (a) {
      this.ua && this.ua(a);
    };
    W.prototype.argPackAdvance = 8;
    W.prototype.readValueFromPointer = lc;
    W.prototype.deleteObject = function (a) {
      if (null !== a) a["delete"]();
    };
    W.prototype.fromWireType = function (a) {
      function b() {
        return this.Ja
          ? ac(this.ba.za, { da: this.Hb, aa: c, ia: this, ha: a })
          : ac(this.ba.za, { da: this, aa: a });
      }
      var c = this.Ab(a);
      if (!c) return this.ab(a), null;
      var d = $b(this.ba, c);
      if (void 0 !== d) {
        if (0 === d.X.count.value) return (d.X.aa = c), (d.X.ha = a), d.clone();
        d = d.clone();
        this.ab(a);
        return d;
      }
      d = this.ba.zb(c);
      d = Vb[d];
      if (!d) return b.call(this);
      d = this.Ia ? d.wb : d.pointerType;
      var e = Ub(c, this.ba, d.ba);
      return null === e
        ? b.call(this)
        : this.Ja
          ? ac(d.ba.za, { da: d, aa: e, ia: this, ha: a })
          : ac(d.ba.za, { da: d, aa: e });
    };
    sc = g.UnboundTypeError = Lb("UnboundTypeError");
    g.count_emval_handles = function () {
      for (var a = 0, b = 5; b < Z.length; ++b) void 0 !== Z[b] && ++a;
      return a;
    };
    g.get_first_emval = function () {
      for (var a = 5; a < Z.length; ++a) if (void 0 !== Z[a]) return Z[a];
      return null;
    };
    var Xc = {
      j: function (a) {
        return Vc(a + 24) + 24;
      },
      i: function (a, b, c) {
        new La(a).xa(b, c);
        Ma++;
        throw a;
      },
      m: function (a, b, c) {
        Eb = c;
        try {
          var d = Q(a);
          switch (b) {
            case 0:
              var e = P();
              return 0 > e ? -28 : sb(d, e).ra;
            case 1:
            case 2:
              return 0;
            case 3:
              return d.flags;
            case 4:
              return (e = P()), (d.flags |= e), 0;
            case 5:
              return (e = P()), (A[(e + 0) >> 1] = 2), 0;
            case 6:
            case 7:
              return 0;
            case 16:
            case 8:
              return -28;
            case 9:
              return (C[Wc() >> 2] = 28), -1;
            default:
              return -28;
          }
        } catch (f) {
          if ("undefined" == typeof O || !(f instanceof K)) throw f;
          return -f.qa;
        }
      },
      B: function (a, b, c) {
        Eb = c;
        try {
          var d = Q(a);
          switch (b) {
            case 21509:
            case 21505:
              return d.ea ? 0 : -59;
            case 21510:
            case 21511:
            case 21512:
            case 21506:
            case 21507:
            case 21508:
              return d.ea ? 0 : -59;
            case 21519:
              if (!d.ea) return -59;
              var e = P();
              return (C[e >> 2] = 0);
            case 21520:
              return d.ea ? -28 : -59;
            case 21531:
              a = e = P();
              if (!d.$.Db) throw new K(59);
              return d.$.Db(d, b, a);
            case 21523:
              return d.ea ? 0 : -59;
            case 21524:
              return d.ea ? 0 : -59;
            default:
              return -28;
          }
        } catch (f) {
          if ("undefined" == typeof O || !(f instanceof K)) throw f;
          return -f.qa;
        }
      },
      C: function (a, b, c, d) {
        Eb = d;
        try {
          b = pa(b);
          var e = b;
          if ("/" === e.charAt(0)) b = e;
          else {
            var f = -100 === a ? "/" : Q(a).path;
            if (0 == e.length) throw new K(44);
            b = J(f + "/" + e);
          }
          var k = d ? P() : 0;
          return xb(b, c, k).ra;
        } catch (l) {
          if ("undefined" == typeof O || !(l instanceof K)) throw l;
          return -l.qa;
        }
      },
      x: function (a, b) {
        try {
          a = pa(a);
          a: {
            try {
              var c = M(a, { Pa: !0 }).node;
              if (!c) throw new K(44);
              if (!c.Y.ka) throw new K(63);
              var d = c.Y.ka(c);
            } catch (f) {
              if (f && f.node && J(a) !== J(jb(f.node))) {
                var e = -54;
                break a;
              }
              throw f;
            }
            C[b >> 2] = d.xb;
            C[(b + 8) >> 2] = d.Ra;
            C[(b + 12) >> 2] = d.mode;
            D[(b + 16) >> 2] = d.Gb;
            C[(b + 20) >> 2] = d.uid;
            C[(b + 24) >> 2] = d.Bb;
            C[(b + 28) >> 2] = d.Da;
            I = [
              d.size >>> 0,
              ((H = d.size),
              1 <= +Math.abs(H)
                ? 0 < H
                  ? (Math.min(+Math.floor(H / 4294967296), 4294967295) | 0) >>>
                    0
                  : ~~+Math.ceil((H - +(~~H >>> 0)) / 4294967296) >>> 0
                : 0),
            ];
            C[(b + 40) >> 2] = I[0];
            C[(b + 44) >> 2] = I[1];
            C[(b + 48) >> 2] = 4096;
            C[(b + 52) >> 2] = d.ub;
            I = [
              Math.floor(d.Ya.getTime() / 1e3) >>> 0,
              ((H = Math.floor(d.Ya.getTime() / 1e3)),
              1 <= +Math.abs(H)
                ? 0 < H
                  ? (Math.min(+Math.floor(H / 4294967296), 4294967295) | 0) >>>
                    0
                  : ~~+Math.ceil((H - +(~~H >>> 0)) / 4294967296) >>> 0
                : 0),
            ];
            C[(b + 56) >> 2] = I[0];
            C[(b + 60) >> 2] = I[1];
            D[(b + 64) >> 2] = 0;
            I = [
              Math.floor(d.ib.getTime() / 1e3) >>> 0,
              ((H = Math.floor(d.ib.getTime() / 1e3)),
              1 <= +Math.abs(H)
                ? 0 < H
                  ? (Math.min(+Math.floor(H / 4294967296), 4294967295) | 0) >>>
                    0
                  : ~~+Math.ceil((H - +(~~H >>> 0)) / 4294967296) >>> 0
                : 0),
            ];
            C[(b + 72) >> 2] = I[0];
            C[(b + 76) >> 2] = I[1];
            D[(b + 80) >> 2] = 0;
            I = [
              Math.floor(d.$a.getTime() / 1e3) >>> 0,
              ((H = Math.floor(d.$a.getTime() / 1e3)),
              1 <= +Math.abs(H)
                ? 0 < H
                  ? (Math.min(+Math.floor(H / 4294967296), 4294967295) | 0) >>>
                    0
                  : ~~+Math.ceil((H - +(~~H >>> 0)) / 4294967296) >>> 0
                : 0),
            ];
            C[(b + 88) >> 2] = I[0];
            C[(b + 92) >> 2] = I[1];
            D[(b + 96) >> 2] = 0;
            I = [
              d.Ra >>> 0,
              ((H = d.Ra),
              1 <= +Math.abs(H)
                ? 0 < H
                  ? (Math.min(+Math.floor(H / 4294967296), 4294967295) | 0) >>>
                    0
                  : ~~+Math.ceil((H - +(~~H >>> 0)) / 4294967296) >>> 0
                : 0),
            ];
            C[(b + 104) >> 2] = I[0];
            C[(b + 108) >> 2] = I[1];
            e = 0;
          }
          return e;
        } catch (f) {
          if ("undefined" == typeof O || !(f instanceof K)) throw f;
          return -f.qa;
        }
      },
      s: function () {},
      E: function (a, b, c, d, e) {
        var f = Fb(c);
        b = R(b);
        U(a, {
          name: b,
          fromWireType: function (k) {
            return !!k;
          },
          toWireType: function (k, l) {
            return l ? d : e;
          },
          argPackAdvance: 8,
          readValueFromPointer: function (k) {
            if (1 === c) var l = y;
            else if (2 === c) l = A;
            else if (4 === c) l = C;
            else throw new TypeError("Unknown boolean type size: " + b);
            return this.fromWireType(l[k >> f]);
          },
          oa: null,
        });
      },
      q: function (a, b, c, d, e, f, k, l, n, p, q, v, z) {
        q = R(q);
        f = X(e, f);
        l && (l = X(k, l));
        p && (p = X(n, p));
        z = X(v, z);
        var h = Jb(q);
        dc(h, function () {
          vc("Cannot construct " + q + " due to unbound types", [d]);
        });
        Pb([a, b, c], d ? [d] : [], function (r) {
          r = r[0];
          if (d) {
            var x = r.ba;
            var B = x.za;
          } else B = V.prototype;
          r = Kb(h, function () {
            if (Object.getPrototypeOf(this) !== E)
              throw new Mb("Use 'new' to construct " + q);
            if (void 0 === da.sa)
              throw new Mb(q + " has no accessible constructor");
            var oc = da.sa[arguments.length];
            if (void 0 === oc)
              throw new Mb(
                "Tried to invoke ctor of " +
                  q +
                  " with invalid number of parameters (" +
                  arguments.length +
                  ") - expected (" +
                  Object.keys(da.sa).toString() +
                  ") parameters instead!",
              );
            return oc.apply(this, arguments);
          });
          var E = Object.create(B, { constructor: { value: r } });
          r.prototype = E;
          var da = new ec(q, r, E, z, x, f, l, p);
          x = new W(q, da, !0, !1);
          B = new W(q + "*", da, !1, !1);
          var pc = new W(q + " const*", da, !1, !0);
          Vb[a] = { pointerType: B, wb: pc };
          mc(h, r);
          return [x, B, pc];
        });
      },
      p: function (a, b, c, d, e, f) {
        0 < b || u();
        var k = wc(b, c);
        e = X(d, e);
        Pb([], [a], function (l) {
          l = l[0];
          var n = "constructor " + l.name;
          void 0 === l.ba.sa && (l.ba.sa = []);
          if (void 0 !== l.ba.sa[b - 1])
            throw new Mb(
              "Cannot register multiple constructors with identical number of parameters (" +
                (b - 1) +
                ") for class '" +
                l.name +
                "'! Overload resolution is currently only performed using the parameter count, not actual type info!",
            );
          l.ba.sa[b - 1] = () => {
            vc("Cannot construct " + l.name + " due to unbound types", k);
          };
          Pb([], k, function (p) {
            p.splice(1, 0, null);
            l.ba.sa[b - 1] = zc(n, p, null, e, f);
            return [];
          });
          return [];
        });
      },
      f: function (a, b, c, d, e, f, k, l) {
        var n = wc(c, d);
        b = R(b);
        f = X(e, f);
        Pb([], [a], function (p) {
          function q() {
            vc("Cannot call " + v + " due to unbound types", n);
          }
          p = p[0];
          var v = p.name + "." + b;
          b.startsWith("@@") && (b = Symbol[b.substring(2)]);
          l && p.ba.Ib.push(b);
          var z = p.ba.za,
            h = z[b];
          void 0 === h ||
          (void 0 === h.ga && h.className !== p.name && h.Ga === c - 2)
            ? ((q.Ga = c - 2), (q.className = p.name), (z[b] = q))
            : (cc(z, b, v), (z[b].ga[c - 2] = q));
          Pb([], n, function (r) {
            r = zc(v, r, p, f, k);
            void 0 === z[b].ga
              ? ((r.Ga = c - 2), (z[b] = r))
              : (z[b].ga[c - 2] = r);
            return [];
          });
          return [];
        });
      },
      D: function (a, b) {
        b = R(b);
        U(a, {
          name: b,
          fromWireType: function (c) {
            c || T("Cannot use deleted val. handle = " + c);
            var d = Z[c].value;
            Bc(c);
            return d;
          },
          toWireType: function (c, d) {
            return jc(d);
          },
          argPackAdvance: 8,
          readValueFromPointer: lc,
          oa: null,
        });
      },
      n: function (a, b, c) {
        c = Fb(c);
        b = R(b);
        U(a, {
          name: b,
          fromWireType: function (d) {
            return d;
          },
          toWireType: function (d, e) {
            return e;
          },
          argPackAdvance: 8,
          readValueFromPointer: Cc(b, c),
          oa: null,
        });
      },
      h: function (a, b, c, d, e, f) {
        var k = wc(b, c);
        a = R(a);
        e = X(d, e);
        dc(
          a,
          function () {
            vc("Cannot call " + a + " due to unbound types", k);
          },
          b - 1,
        );
        Pb([], k, function (l) {
          mc(a, zc(a, [l[0], null].concat(l.slice(1)), null, e, f), b - 1);
          return [];
        });
      },
      e: function (a, b, c, d, e) {
        b = R(b);
        -1 === e && (e = 4294967295);
        e = Fb(c);
        var f = (l) => l;
        if (0 === d) {
          var k = 32 - 8 * c;
          f = (l) => (l << k) >>> k;
        }
        c = b.includes("unsigned")
          ? function (l, n) {
              return n >>> 0;
            }
          : function (l, n) {
              return n;
            };
        U(a, {
          name: b,
          fromWireType: f,
          toWireType: c,
          argPackAdvance: 8,
          readValueFromPointer: Dc(b, e, 0 !== d),
          oa: null,
        });
      },
      d: function (a, b, c) {
        function d(f) {
          f >>= 2;
          var k = D;
          return new e(sa, k[f + 1], k[f]);
        }
        var e = [
          Int8Array,
          Uint8Array,
          Int16Array,
          Uint16Array,
          Int32Array,
          Uint32Array,
          Float32Array,
          Float64Array,
        ][b];
        c = R(c);
        U(
          a,
          {
            name: c,
            fromWireType: d,
            argPackAdvance: 8,
            readValueFromPointer: d,
          },
          { Cb: !0 },
        );
      },
      o: function (a, b) {
        b = R(b);
        var c = "std::string" === b;
        U(a, {
          name: b,
          fromWireType: function (d) {
            var e = D[d >> 2],
              f = d + 4;
            if (c)
              for (var k = f, l = 0; l <= e; ++l) {
                var n = f + l;
                if (l == e || 0 == w[n]) {
                  k = pa(k, n - k);
                  if (void 0 === p) var p = k;
                  else (p += String.fromCharCode(0)), (p += k);
                  k = n + 1;
                }
              }
            else {
              p = Array(e);
              for (l = 0; l < e; ++l) p[l] = String.fromCharCode(w[f + l]);
              p = p.join("");
            }
            Y(d);
            return p;
          },
          toWireType: function (d, e) {
            e instanceof ArrayBuffer && (e = new Uint8Array(e));
            var f = "string" == typeof e;
            f ||
              e instanceof Uint8Array ||
              e instanceof Uint8ClampedArray ||
              e instanceof Int8Array ||
              T("Cannot pass non-string to std::string");
            var k = c && f ? ra(e) : e.length;
            var l = Vc(4 + k + 1),
              n = l + 4;
            D[l >> 2] = k;
            if (c && f) qa(e, w, n, k + 1);
            else if (f)
              for (f = 0; f < k; ++f) {
                var p = e.charCodeAt(f);
                255 < p &&
                  (Y(n),
                  T("String has UTF-16 code units that do not fit in 8 bits"));
                w[n + f] = p;
              }
            else for (f = 0; f < k; ++f) w[n + f] = e[f];
            null !== d && d.push(Y, l);
            return l;
          },
          argPackAdvance: 8,
          readValueFromPointer: lc,
          oa: function (d) {
            Y(d);
          },
        });
      },
      k: function (a, b, c) {
        c = R(c);
        if (2 === b) {
          var d = Fc;
          var e = Gc;
          var f = Hc;
          var k = () => ta;
          var l = 1;
        } else
          4 === b && ((d = Ic), (e = Jc), (f = Kc), (k = () => D), (l = 2));
        U(a, {
          name: c,
          fromWireType: function (n) {
            for (var p = D[n >> 2], q = k(), v, z = n + 4, h = 0; h <= p; ++h) {
              var r = n + 4 + h * b;
              if (h == p || 0 == q[r >> l])
                (z = d(z, r - z)),
                  void 0 === v
                    ? (v = z)
                    : ((v += String.fromCharCode(0)), (v += z)),
                  (z = r + b);
            }
            Y(n);
            return v;
          },
          toWireType: function (n, p) {
            "string" != typeof p &&
              T("Cannot pass non-string to C++ string type " + c);
            var q = f(p),
              v = Vc(4 + q + b);
            D[v >> 2] = q >> l;
            e(p, v + 4, q + b);
            null !== n && n.push(Y, v);
            return v;
          },
          argPackAdvance: 8,
          readValueFromPointer: lc,
          oa: function (n) {
            Y(n);
          },
        });
      },
      F: function (a, b) {
        b = R(b);
        U(a, {
          Vb: !0,
          name: b,
          argPackAdvance: 0,
          fromWireType: function () {},
          toWireType: function () {},
        });
      },
      c: Bc,
      b: function (a) {
        4 < a && (Z[a].Va += 1);
      },
      g: function (a, b) {
        var c = S[a];
        void 0 === c && T("_emval_take_value has unknown type " + tc(a));
        a = c;
        a = a.readValueFromPointer(b);
        return jc(a);
      },
      a: function () {
        u("");
      },
      y: function (a, b, c) {
        w.copyWithin(a, b, b + c);
      },
      w: function (a) {
        var b = w.length;
        a >>>= 0;
        if (2147483648 < a) return !1;
        for (var c = 1; 4 >= c; c *= 2) {
          var d = b * (1 + 0.2 / c);
          d = Math.min(d, a + 100663296);
          var e = Math;
          d = Math.max(a, d);
          e = e.min.call(e, 2147483648, d + ((65536 - (d % 65536)) % 65536));
          a: {
            try {
              la.grow((e - sa.byteLength + 65535) >>> 16);
              wa();
              var f = 1;
              break a;
            } catch (k) {}
            f = void 0;
          }
          if (f) return !0;
        }
        return !1;
      },
      u: function (a, b) {
        var c = 0;
        Mc().forEach(function (d, e) {
          var f = b + c;
          e = D[(a + 4 * e) >> 2] = f;
          for (f = 0; f < d.length; ++f) y[e++ >> 0] = d.charCodeAt(f);
          y[e >> 0] = 0;
          c += d.length + 1;
        });
        return 0;
      },
      v: function (a, b) {
        var c = Mc();
        D[a >> 2] = c.length;
        var d = 0;
        c.forEach(function (e) {
          d += e.length + 1;
        });
        D[b >> 2] = d;
        return 0;
      },
      l: function (a) {
        try {
          var b = Q(a);
          if (null === b.ra) throw new K(8);
          b.Qa && (b.Qa = null);
          try {
            b.$.close && b.$.close(b);
          } catch (c) {
            throw c;
          } finally {
            eb[b.ra] = null;
          }
          b.ra = null;
          return 0;
        } catch (c) {
          if ("undefined" == typeof O || !(c instanceof K)) throw c;
          return c.qa;
        }
      },
      A: function (a, b, c, d) {
        try {
          a: {
            var e = Q(a);
            a = b;
            for (var f = (b = 0); f < c; f++) {
              var k = D[a >> 2],
                l = D[(a + 4) >> 2];
              a += 8;
              var n = e,
                p = k,
                q = l,
                v = void 0,
                z = y;
              if (0 > q || 0 > v) throw new K(28);
              if (null === n.ra) throw new K(8);
              if (1 === (n.flags & 2097155)) throw new K(8);
              if (16384 === (n.node.mode & 61440)) throw new K(31);
              if (!n.$.read) throw new K(28);
              var h = "undefined" != typeof v;
              if (!h) v = n.position;
              else if (!n.seekable) throw new K(70);
              var r = n.$.read(n, z, p, q, v);
              h || (n.position += r);
              var x = r;
              if (0 > x) {
                var B = -1;
                break a;
              }
              b += x;
              if (x < l) break;
            }
            B = b;
          }
          D[d >> 2] = B;
          return 0;
        } catch (E) {
          if ("undefined" == typeof O || !(E instanceof K)) throw E;
          return E.qa;
        }
      },
      r: function (a, b, c, d, e) {
        try {
          b =
            (c + 2097152) >>> 0 < 4194305 - !!b
              ? (b >>> 0) + 4294967296 * c
              : NaN;
          if (isNaN(b)) return 61;
          var f = Q(a);
          yb(f, b, d);
          I = [
            f.position >>> 0,
            ((H = f.position),
            1 <= +Math.abs(H)
              ? 0 < H
                ? (Math.min(+Math.floor(H / 4294967296), 4294967295) | 0) >>> 0
                : ~~+Math.ceil((H - +(~~H >>> 0)) / 4294967296) >>> 0
              : 0),
          ];
          C[e >> 2] = I[0];
          C[(e + 4) >> 2] = I[1];
          f.Qa && 0 === b && 0 === d && (f.Qa = null);
          return 0;
        } catch (k) {
          if ("undefined" == typeof O || !(k instanceof K)) throw k;
          return k.qa;
        }
      },
      z: function (a, b, c, d) {
        try {
          a: {
            var e = Q(a);
            a = b;
            for (var f = (b = 0); f < c; f++) {
              var k = D[a >> 2],
                l = D[(a + 4) >> 2];
              a += 8;
              var n = e,
                p = k,
                q = l,
                v = void 0,
                z = y;
              if (0 > q || 0 > v) throw new K(28);
              if (null === n.ra) throw new K(8);
              if (0 === (n.flags & 2097155)) throw new K(8);
              if (16384 === (n.node.mode & 61440)) throw new K(31);
              if (!n.$.write) throw new K(28);
              n.seekable && n.flags & 1024 && yb(n, 0, 2);
              var h = "undefined" != typeof v;
              if (!h) v = n.position;
              else if (!n.seekable) throw new K(70);
              var r = n.$.write(n, z, p, q, v, void 0);
              h || (n.position += r);
              var x = r;
              if (0 > x) {
                var B = -1;
                break a;
              }
              b += x;
            }
            B = b;
          }
          D[d >> 2] = B;
          return 0;
        } catch (E) {
          if ("undefined" == typeof O || !(E instanceof K)) throw E;
          return E.qa;
        }
      },
      t: function (a, b, c, d) {
        return Rc(a, b, c, d);
      },
    };
    (function () {
      function a(e) {
        g.asm = e.exports;
        la = g.asm.G;
        wa();
        xa = g.asm.O;
        za.unshift(g.asm.H);
        F--;
        g.monitorRunDependencies && g.monitorRunDependencies(F);
        0 == F &&
          (null !== Da && (clearInterval(Da), (Da = null)),
          Ea && ((e = Ea), (Ea = null), e()));
      }
      function b(e) {
        a(e.instance);
      }
      function c(e) {
        return Ia()
          .then(function (f) {
            return WebAssembly.instantiate(f, d);
          })
          .then(function (f) {
            return f;
          })
          .then(e, function (f) {
            t("failed to asynchronously prepare wasm: " + f);
            u(f);
          });
      }
      var d = { a: Xc };
      F++;
      g.monitorRunDependencies && g.monitorRunDependencies(F);
      if (g.instantiateWasm)
        try {
          return g.instantiateWasm(d, a);
        } catch (e) {
          t("Module.instantiateWasm callback failed with error: " + e), ba(e);
        }
      (function () {
        return ka ||
          "function" != typeof WebAssembly.instantiateStreaming ||
          Fa() ||
          "function" != typeof fetch
          ? c(b)
          : fetch(G, { credentials: "same-origin" }).then(function (e) {
              return WebAssembly.instantiateStreaming(e, d).then(
                b,
                function (f) {
                  t("wasm streaming compile failed: " + f);
                  t("falling back to ArrayBuffer instantiation");
                  return c(b);
                },
              );
            });
      })().catch(ba);
      return {};
    })();
    g.___wasm_call_ctors = function () {
      return (g.___wasm_call_ctors = g.asm.H).apply(null, arguments);
    };
    var Vc = (g._malloc = function () {
        return (Vc = g._malloc = g.asm.I).apply(null, arguments);
      }),
      Y = (g._free = function () {
        return (Y = g._free = g.asm.J).apply(null, arguments);
      });
    g._main = function () {
      return (g._main = g.asm.K).apply(null, arguments);
    };
    var Wc = (g.___errno_location = function () {
        return (Wc = g.___errno_location = g.asm.L).apply(null, arguments);
      }),
      uc = (g.___getTypeName = function () {
        return (uc = g.___getTypeName = g.asm.M).apply(null, arguments);
      });
    g.__embind_initialize_bindings = function () {
      return (g.__embind_initialize_bindings = g.asm.N).apply(null, arguments);
    };
    var Yc = (g.stackAlloc = function () {
      return (Yc = g.stackAlloc = g.asm.P).apply(null, arguments);
    });
    g.___cxa_is_pointer_type = function () {
      return (g.___cxa_is_pointer_type = g.asm.Q).apply(null, arguments);
    };
    g.dynCall_jiji = function () {
      return (g.dynCall_jiji = g.asm.R).apply(null, arguments);
    };
    g.dynCall_iiji = function () {
      return (g.dynCall_iiji = g.asm.S).apply(null, arguments);
    };
    g.dynCall_viijii = function () {
      return (g.dynCall_viijii = g.asm.T).apply(null, arguments);
    };
    g.dynCall_iiiiij = function () {
      return (g.dynCall_iiiiij = g.asm.U).apply(null, arguments);
    };
    g.dynCall_iiiiijj = function () {
      return (g.dynCall_iiiiijj = g.asm.V).apply(null, arguments);
    };
    g.dynCall_iiiiiijj = function () {
      return (g.dynCall_iiiiiijj = g.asm.W).apply(null, arguments);
    };
    var Zc;
    Ea = function $c() {
      Zc || ad();
      Zc || (Ea = $c);
    };
    function bd(a) {
      var b = g._main;
      a = a || [];
      a.unshift(fa);
      var c = a.length,
        d = Yc(4 * (c + 1)),
        e = d >> 2;
      a.forEach((k) => {
        var l = C,
          n = e++,
          p = ra(k) + 1,
          q = Yc(p);
        qa(k, y, q, p);
        l[n] = q;
      });
      C[e] = 0;
      try {
        var f = b(c, d);
        Sc(f);
      } catch (k) {
        k instanceof Ja || "unwind" == k || ha(1, k);
      }
    }
    function ad() {
      function a() {
        if (!Zc && ((Zc = !0), (g.calledRun = !0), !ma)) {
          g.noFSInit ||
            Ab ||
            ((Ab = !0),
            zb(),
            (g.stdin = g.stdin),
            (g.stdout = g.stdout),
            (g.stderr = g.stderr),
            g.stdin ? Db("stdin", g.stdin) : vb("/dev/tty", "/dev/stdin"),
            g.stdout
              ? Db("stdout", null, g.stdout)
              : vb("/dev/tty", "/dev/stdout"),
            g.stderr
              ? Db("stderr", null, g.stderr)
              : vb("/dev/tty1", "/dev/stderr"),
            xb("/dev/stdin", 0),
            xb("/dev/stdout", 1),
            xb("/dev/stderr", 1));
          hb = !1;
          Ka(za);
          Ka(Aa);
          aa(g);
          if (g.onRuntimeInitialized) g.onRuntimeInitialized();
          cd && bd(b);
          if (g.postRun)
            for (
              "function" == typeof g.postRun && (g.postRun = [g.postRun]);
              g.postRun.length;

            ) {
              var c = g.postRun.shift();
              Ba.unshift(c);
            }
          Ka(Ba);
        }
      }
      var b = b || ea;
      if (!(0 < F)) {
        if (g.preRun)
          for (
            "function" == typeof g.preRun && (g.preRun = [g.preRun]);
            g.preRun.length;

          )
            Ca();
        Ka(ya);
        0 < F ||
          (g.setStatus
            ? (g.setStatus("Running..."),
              setTimeout(function () {
                setTimeout(function () {
                  g.setStatus("");
                }, 1);
                a();
              }, 1))
            : a());
      }
    }
    if (g.preInit)
      for (
        "function" == typeof g.preInit && (g.preInit = [g.preInit]);
        0 < g.preInit.length;

      )
        g.preInit.pop()();
    var cd = !1;
    g.noInitialRun && (cd = !1);
    ad();

    return jxl.ready;
  };
})();
export default jxl;
