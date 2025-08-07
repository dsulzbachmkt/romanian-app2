import React, { useEffect, useMemo, useRef, useState } from "react";

/* =========================================
   Utilities & storage
========================================= */
const LS = {
  points: "roa_points",
  streak: "roa_streak",
  last: "roa_last",
  goal: "roa_goal",
  level: "roa_level",
  unitIdx: "roa_unit_idx",
  unitScore: "roa_unit_score",
};

const LEVELS = ["A1", "A2", "B1", "B2"];
const today = () => new Date().toISOString().slice(0, 10);
const ri = (n) => Math.floor(Math.random() * n);
const speak = (t, lang = "ro-RO") => {
  try {
    const u = new SpeechSynthesisUtterance(t);
    u.lang = lang;
    u.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
};

/* =========================================
   Core words & Themes (culturally rich)
========================================= */
const CORE = [
  { ro: "bună", pt: "oi", ipa: "BU-nă", level: "A1", note: "Cumprimento informal usado o dia todo." },
  { ro: "mulțumesc", pt: "obrigado", ipa: "mul-tsu-MESK", level: "A1", note: "Resposta comum: cu plăcere (de nada)." },
  { ro: "te rog", pt: "por favor", ipa: "te rog", level: "A1", note: "Vă rog no formal/plural." },
  { ro: "apă", pt: "água", ipa: "A-pă", level: "A1", note: "ă é vogal central neutra." },
  { ro: "pâine", pt: "pão", ipa: "PÂI-ne", level: "A1", note: "â/î som central." },
  { ro: "poftă bună", pt: "bom apetite", ipa: "POF-tă BU-nă", level: "A2", note: "Dito antes das refeições." },
  { ro: "dor", pt: "saudade", ipa: "dor", level: "B1", note: "Nuança cultural de falta e anseio profundo." },
];

const THEMES = [
  {
    id: "cafenea",
    title: "Cafenea & Social",
    context: "Cultura do café em Bucareste e Cluj. Espresso scurt, cafea la ibric, conversa longa.",
    words: [
      { ro: "cafea", pt: "café", ipa: "ka-FEA" },
      { ro: "zahăr", pt: "açúcar", ipa: "ZA-hăr" },
      { ro: "lapte", pt: "leite", ipa: "LAP-te" },
      { ro: "ceaşcă", pt: "xícara", ipa: "CHIASH-că" },
      { ro: "nota, te rog", pt: "a conta, por favor", ipa: "NO-ta te rog" },
      { ro: "terasă", pt: "esplanada", ipa: "te-RA-să" },
      { ro: "prieteni", pt: "amigos", ipa: "pri-E-te-ni" },
    ],
    tasks: [
      "Faça um pedido completo para duas pessoas e peça a conta usando te rog",
      "Cumprimente o barista com bună e agradeça com mulțumesc",
    ],
  },
  {
    id: "piata",
    title: "Piața Agroalimentară",
    context: "Feiras a céu aberto, sazonalidade e barganha gentil.",
    words: [
      { ro: "piață", pt: "feira/mercado", ipa: "PI-a-tsă" },
      { ro: "brânză", pt: "queijo", ipa: "BRÂN-ză" },
      { ro: "ouă", pt: "ovos", ipa: "O-ă" },
      { ro: "legume", pt: "legumes", ipa: "le-GU-me" },
      { ro: "fructe", pt: "frutas", ipa: "FRUC-te" },
      { ro: "cât costă?", pt: "quanto custa?", ipa: "kât KOS-tă" },
      { ro: "ieftin", pt: "barato", ipa: "IEF-tin" },
      { ro: "scump", pt: "caro", ipa: "scump" },
    ],
    tasks: ["Pergunte preços, compare ieftin vs scump e compre pâine şi mere"],
  },
  {
    id: "calatorii",
    title: "Călătorii prin Carpați",
    context: "Trem até Brașov, trilhas nos Cárpatos, pensiuni familiares.",
    words: [
      { ro: "gară", pt: "estação", ipa: "GA-ră" },
      { ro: "bilet", pt: "bilhete", ipa: "bi-LET" },
      { ro: "pensiune", pt: "pousada", ipa: "pen-si-U-ne" },
      { ro: "munte", pt: "montanha", ipa: "MUN-te" },
      { ro: "hartă", pt: "mapa", ipa: "HAR-tă" },
      { ro: "rezervare", pt: "reserva", ipa: "re-zer-VA-re" },
      { ro: "cameră dublă", pt: "quarto duplo", ipa: "CA-me-ră DUB-lă" },
    ],
    tasks: ["Monte um roteiro de fim de semana e faça uma rezervare la o pensiune"],
  },
  {
    id: "traditii",
    title: "Tradiții & Sărbători",
    context: "Mărțișor em 1º de março, Paște com cozonac, colinde no inverno.",
    words: [
      { ro: "mărțișor", pt: "mimo de 1º de março", ipa: "măr-tsi-ȘOR" },
      { ro: "sărbătoare", pt: "festa/feriado", ipa: "săr-bă-TOA-re" },
      { ro: "cozonac", pt: "pão doce", ipa: "co-zo-NAC" },
      { ro: "sarmale", pt: "charuto de repolho", ipa: "sar-MA-le" },
      { ro: "colinde", pt: "canções natalinas", ipa: "co-LIN-de" },
      { ro: "urare", pt: "voto/saudação", ipa: "u-RA-re" },
    ],
    tasks: ["Escreva uma urare curta para um amigo em romeno"],
  },
  // extra packs
  {
    id: "muzica",
    title: "Muzică şi Arte",
    context: "Festival Enescu, danças folclóricas, cena indie em Cluj e Bucareste.",
    words: [
      { ro: "muzică", pt: "música", ipa: "" },
      { ro: "festival", pt: "festival", ipa: "" },
      { ro: "cântec", pt: "canção", ipa: "" },
      { ro: "trupă", pt: "banda", ipa: "" },
      { ro: "dans popular", pt: "dança folclórica", ipa: "" },
    ],
    tasks: ["Monte uma playlist de 5 cântece romeneşti e escreva por que você gostou de cada uma"],
  },
  {
    id: "istorie_regiuni",
    title: "Istorie şi Regiuni",
    context: "Transilvania, Moldova, Ţara Românească, Maramureş, Bucovina, Dobrogea e o Danúbio.",
    words: [
      { ro: "Transilvania", pt: "Transilvânia", ipa: "" },
      { ro: "Bucovina", pt: "Bucovina", ipa: "" },
      { ro: "Maramureş", pt: "Maramureche", ipa: "" },
      { ro: "Dobrogea", pt: "Dobruja", ipa: "" },
      { ro: "Dunărea", pt: "Danúbio", ipa: "" },
    ],
    tasks: ["Escolha uma região e escreva um mini roteiro de 2 dias em romeno"],
  },
  {
    id: "formulare",
    title: "Formal şi Birocrație",
    context: "Vocabulário prático para órgãos públicos, consultas e residência.",
    words: [
      { ro: "formular", pt: "formulário", ipa: "" },
      { ro: "programare", pt: "agendamento", ipa: "" },
      { ro: "buletin", pt: "RG/ID", ipa: "" },
      { ro: "rezidenţă", pt: "residência", ipa: "" },
      { ro: "program", pt: "horário de atendimento", ipa: "" },
      { ro: "taxă", pt: "taxa", ipa: "" },
    ],
    tasks: ["Preencha um formulário fictício com nome, endereço e programare em romeno"],
  },
];

const CULT = [
  { title: "Cafeneaua de cartier", text: "Pedir um espresso scurt ou cafea la ibric é comum.", task: "Faça um mini diálogo pedindo e agradecendo." },
  { title: "Mărțișor", text: "1º de março marca a chegada da primavera.", task: "Escreva uma urare para oferecer um mărțișor." },
  { title: "Dor", text: "Conceito próximo de saudade.", task: "Grave-se dizendo: Îmi este dor de..." },
  { title: "Mănăstiri în Bucovina", text: "Frescos azuis em monastérios pintados.", task: "Descreva cores usando frumos/mare." },
];

/* =========================================
   Curriculum map with checkpoints
========================================= */
const CURRICULUM = {
  A1: [
    { id: "a1u1", name: "Saudações e Café", themes: ["cafenea", "piata"], pass: 60 },
    { id: "a1u2", name: "Mercado e Números", themes: ["piata"], pass: 65 },
  ],
  A2: [{ id: "a2u1", name: "Viagem e Rotina", themes: ["calatorii", "cafenea"], pass: 70 }],
  B1: [{ id: "b1u1", name: "Tradições e Narrativa", themes: ["traditii", "calatorii"], pass: 75 }],
  B2: [{ id: "b2u1", name: "Nuances Culturais e Opinião", themes: ["traditii"], pass: 80 }],
};

/* =========================================
   Real-world mission scenarios
========================================= */
const SCENARIOS = [
  {
    id: "train",
    title: "Reservar trem CFR",
    context: "Compra de bilhetes na CFR Călători para uma viagem Bucareste → Brașov.",
    steps: [
      { ro: "bilet dus-întors", pt: "ida e volta" },
      { ro: "când pleacă următorul tren?", pt: "quando sai o próximo trem?" },
      { ro: "aş vrea vagon de dormit?", pt: "eu gostaria de vagão leito?" },
      { ro: "câte persoane? două", pt: "quantas pessoas? duas" },
      { ro: "plata cu cardul", pt: "pagamento com cartão" },
    ],
  },
  {
    id: "cofetarie",
    title: "Encomendar numa cofetărie",
    context: "Pedido de doces e café em uma confeitaria tradicional.",
    steps: [
      { ro: "o prăjitură cu ciocolată, te rog", pt: "um bolo de chocolate, por favor" },
      { ro: "două eclere şi o cafea mică", pt: "dois eclairs e um café pequeno" },
      { ro: "mai doriţi altceva?", pt: "deseja mais alguma coisa?" },
      { ro: "nota, vă rog", pt: "a conta, por favor" },
    ],
  },
  {
    id: "residency",
    title: "Formulário de residência",
    context: "Vocabulário e frases para preencher pedido de permis de şedere.",
    steps: [
      { ro: "nume şi prenume", pt: "sobrenome e nome" },
      { ro: "data naşterii", pt: "data de nascimento" },
      { ro: "cetăţenie", pt: "nacionalidade" },
      { ro: "adresă de domiciliu", pt: "endereço" },
      { ro: "semnătură", pt: "assinatura" },
    ],
  },
];

/* =========================================
   Progress hook
========================================= */
function useProgress() {
  const [points, setPoints] = useState(Number(localStorage.getItem(LS.points) || 0));
  const [streak, setStreak] = useState(Number(localStorage.getItem(LS.streak) || 0));
  const [goal, setGoal] = useState(Number(localStorage.getItem(LS.goal) || 50));
  const last = localStorage.getItem(LS.last) || "";

  function addPoints(n) {
    const t = today();
    if (t !== last) {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yk = y.toISOString().slice(0, 10);
      const ns = last === yk ? streak + 1 : 1;
      setStreak(ns);
      localStorage.setItem(LS.streak, String(ns));
      localStorage.setItem(LS.last, t);
    }
    const v = points + n;
    setPoints(v);
    localStorage.setItem(LS.points, String(v));
  }

  useEffect(() => localStorage.setItem(LS.goal, String(goal)), [goal]);
  return { points, streak, goal, setGoal, addPoints };
}

/* =========================================
   UI helpers
========================================= */
const Card = ({ title, children }) => (
  <div className="p-4 bg-white rounded-2xl shadow">
    {title && <div className="text-sm text-gray-600 mb-1">{title}</div>}
    {children}
  </div>
);

function Header({ level, setLevel }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white/70 backdrop-blur rounded-2xl shadow">
      <div>
        <h1 className="text-2xl font-bold">Romanian Lab</h1>
        <p className="text-sm text-gray-600">Imersão A1–B2 para falantes de português</p>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm">Nível</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="border rounded px-2 py-1">
          {LEVELS.map((L) => (
            <option key={L} value={L}>
              {L}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Stats({ points, streak, goal, setGoal }) {
  const pct = Math.min(100, Math.round(((points % goal) / goal) * 100));
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card>
        <div className="text-sm text-gray-500">Pontos</div>
        <div className="text-3xl font-bold">{points}</div>
      </Card>
      <Card>
        <div className="text-sm text-gray-500">Sequência</div>
        <div className="text-3xl font-bold">{streak} dias</div>
      </Card>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Meta diária</div>
            <div className="text-xl font-semibold">{goal} pontos</div>
          </div>
          <input type="number" className="w-24 border rounded px-2 py-1" value={goal} onChange={(e) => setGoal(Number(e.target.value) || 0)} />
        </div>
        <div className="mt-3 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-3 bg-green-500" style={{ width: `${pct}%` }} />
        </div>
      </Card>
    </div>
  );
}

/* =========================================
   Activities
========================================= */
function Flashcards({ level, addPoints }) {
  const pool = useMemo(() => CORE.filter((w) => LEVELS.indexOf(w.level) <= LEVELS.indexOf(level)), [level]);
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const c = pool[i % pool.length];

  useEffect(() => {
    speak(c.ro);
  }, [i]);

  return (
    <Card title="Flashcards">
      <div className="rounded-2xl border p-6 grid gap-3">
        <div className="text-3xl font-bold text-center">{c.ro}</div>
        <div className="text-center text-gray-500">{c.ipa}</div>
        {show && (
          <div className="text-center">
            <div className="text-lg">{c.pt}</div>
            <div className="text-sm text-gray-600 mt-2">{c.note}</div>
          </div>
        )}
        <div className="flex justify-center gap-2">
          <button className="px-3 py-2 rounded bg-gray-100" onClick={() => speak(c.ro)}>
            Ouvir
          </button>
          <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={() => setShow((s) => !s)}>
            {show ? "Esconder" : "Mostrar"}
          </button>
          <button
            className="px-3 py-2 rounded bg-green-600 text-white"
            onClick={() => {
              addPoints(5);
              setI(i + 1);
              setShow(false);
            }}
          >
            Acertei
          </button>
          <button
            className="px-3 py-2 rounded bg-red-600 text-white"
            onClick={() => {
              setI(i + 1);
              setShow(false);
            }}
          >
            Rever
          </button>
        </div>
      </div>
    </Card>
  );
}

function Quiz({ level, addPoints }) {
  const pool = useMemo(() => CORE.filter((w) => LEVELS.indexOf(w.level) <= LEVELS.indexOf(level)), [level]);
  function mk() {
    const a = pool[ri(pool.length)];
    const opts = new Set([a.pt]);
    while (opts.size < 4) opts.add(pool[ri(pool.length)].pt);
    return { q: a.ro, a: a.pt, opts: [...opts].sort(() => Math.random() - 0.5) };
  }
  const [Q, setQ] = useState(mk());
  const [fb, setFb] = useState("");
  return (
    <Card title="Quiz rápido">
      <div className="text-2xl font-bold text-center mb-4">{Q.q}</div>
      <div className="grid md:grid-cols-2 gap-2">
        {Q.opts.map((o) => (
          <button
            key={o}
            className="px-3 py-3 rounded border hover:bg-gray-50"
            onClick={() => {
              const ok = o === Q.a;
              setFb(ok ? "Correto" : "É " + Q.a);
              if (ok) addPoints(8);
              setTimeout(() => {
                setQ(mk());
                setFb("");
              }, 700);
            }}
          >
            {o}
          </button>
        ))}
      </div>
      <div className="h-6 mt-2 text-center text-sm text-gray-700">{fb}</div>
    </Card>
  );
}

function Themes({ addPoints }) {
  const [active, setActive] = useState(THEMES[0].id);
  const t = THEMES.find((x) => x.id === active);
  return (
    <Card title="Temas culturais">
      <div className="flex gap-2 flex-wrap mb-3">
        {THEMES.map((x) => (
          <button key={x.id} className={`px-3 py-2 rounded ${active === x.id ? "bg-blue-600 text-white" : "bg-gray-100"}`} onClick={() => setActive(x.id)}>
            {x.title}
          </button>
        ))}
      </div>
      <p className="text-gray-700">{t.context}</p>
      <div className="mt-3 grid md:grid-cols-2 gap-2">
        {t.words.map((w) => (
          <button
            key={w.ro}
            onClick={() => {
              speak(w.ro);
              addPoints(2);
            }}
            className="px-3 py-2 rounded border flex justify-between"
          >
            <span>
              {w.ro} · {w.pt}
            </span>
            <span className="text-gray-500">{w.ipa}</span>
          </button>
        ))}
      </div>
      <div className="mt-3">
        <div className="text-sm text-gray-600">Missões culturais</div>
        <ul className="list-disc ml-6">
          {t.tasks.map((m, i) => (
            <li key={i} className="my-1">
              {m}
            </li>
          ))}
        </ul>
        <button className="mt-2 px-3 py-2 rounded bg-green-600 text-white" onClick={() => addPoints(6)}>
          Missão feita
        </button>
      </div>
    </Card>
  );
}

function Culture({ addPoints }) {
  const [i, setI] = useState(ri(CULT.length));
  const c = CULT[i];
  return (
    <Card title="Cultura">
      <div className="text-xl font-semibold">{c.title}</div>
      <p className="mt-2 text-gray-700">{c.text}</p>
      <p className="mt-2 text-sm text-gray-600">Tarefa: {c.task}</p>
      <div className="mt-3 flex gap-2">
        <button className="px-3 py-2 rounded bg-gray-100" onClick={() => setI((i + 1) % CULT.length)}>
          Outra
        </button>
        <button className="px-3 py-2 rounded bg-green-600 text-white" onClick={() => addPoints(10)}>
          Concluído
        </button>
      </div>
    </Card>
  );
}

function Game({ addPoints }) {
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const grid = 20,
    cells = 20;
  const stateRef = useRef({ x: 10, y: 10, vx: 1, vy: 0, tail: [{ x: 10, y: 10 }], cheese: { x: ri(cells), y: ri(cells) }, word: "cafea" });

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let raf;
    const draw = () => {
      ctx.fillStyle = "#F8FAFC";
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.strokeStyle = "#E5E7EB";
      for (let i = 0; i <= cells; i++) {
        ctx.beginPath();
        ctx.moveTo(i * grid, 0);
        ctx.lineTo(i * grid, cells * grid);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * grid);
        ctx.lineTo(cells * grid, i * grid);
        ctx.stroke();
      }
      const s = stateRef.current;
      ctx.fillStyle = "#F59E0B";
      ctx.fillRect(s.cheese.x * grid + 2, s.cheese.y * grid + 2, grid - 4, grid - 4);
      ctx.fillStyle = "#2563EB";
      s.tail.forEach((t) => ctx.fillRect(t.x * grid + 3, t.y * grid + 3, grid - 6, grid - 6));
    };
    const step = () => {
      const s = stateRef.current;
      const head = { x: (s.tail[0].x + s.vx + cells) % cells, y: (s.tail[0].y + s.vy + cells) % cells };
      s.tail.unshift(head);
      if (head.x === s.cheese.x && head.y === s.cheese.y) {
        const pack = THEMES[ri(THEMES.length)];
        const w = pack.words[ri(pack.words.length)].ro;
        s.word = w;
        speak(w);
        setScore((sc) => sc + 1);
        addPoints(3);
        s.cheese = { x: ri(cells), y: ri(cells) };
      } else {
        s.tail.pop();
      }
      for (let i = 1; i < s.tail.length; i++) {
        if (s.tail[i].x === head.x && s.tail[i].y === head.y) {
          s.tail = [head];
          setScore(0);
          break;
        }
      }
      draw();
      if (running) raf = requestAnimationFrame(() => setTimeout(step, 90));
    };
    draw();
    if (running) step();
    return () => cancelAnimationFrame(raf);
  }, [running]);

  useEffect(() => {
    const key = (e) => {
      const s = stateRef.current;
      if (e.key === "ArrowUp" && s.vy !== 1) {
        s.vx = 0;
        s.vy = -1;
      } else if (e.key === "ArrowDown" && s.vy !== -1) {
        s.vx = 0;
        s.vy = 1;
      } else if (e.key === "ArrowLeft" && s.vx !== 1) {
        s.vx = -1;
        s.vy = 0;
      } else if (e.key === "ArrowRight" && s.vx !== -1) {
        s.vx = 1;
        s.vy = 0;
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  return (
    <Card title="Jogo do mouse e queijo">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600">Use as setas</div>
        <div className="text-sm">Pontuação {score}</div>
      </div>
      <canvas ref={canvasRef} width={400} height={400} className="rounded border" />
      <div className="mt-2 text-center text-sm">Cada queijo fala uma palavra em romeno</div>
      <div className="mt-2 flex gap-2 justify-center">
        <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={() => setRunning(true)}>
          Iniciar
        </button>
        <button className="px-3 py-2 rounded bg-gray-100" onClick={() => setRunning(false)}>
          Pausar
        </button>
        <button className="px-3 py-2 rounded bg-gray-100" onClick={() => speak(stateRef.current.word)}>
          Repetir palavra
        </button>
      </div>
    </Card>
  );
}

function Scenarios({ addPoints }) {
  const [active, setActive] = useState(SCENARIOS[0].id);
  const s = SCENARIOS.find((x) => x.id === active);
  const [done, setDone] = useState(false);
  return (
    <Card title="Missões do dia (tarefas reais)">
      <div className="flex gap-2 flex-wrap mb-3">
        {SCENARIOS.map((x) => (
          <button
            key={x.id}
            className={`px-3 py-2 rounded ${active === x.id ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => {
              setActive(x.id);
              setDone(false);
            }}
          >
            {x.title}
          </button>
        ))}
      </div>
      <p className="text-gray-700">{s.context}</p>
      <ol className="list-decimal ml-6 mt-3 space-y-2">
        {s.steps.map((st, i) => (
          <li key={i} className="flex items-center justify-between gap-2 border rounded px-3 py-2">
            <div>
              <span className="font-medium">{st.ro}</span> · <span className="text-gray-600">{st.pt}</span>
            </div>
            <div className="flex gap-2">
              <button className="px-2 py-1 rounded bg-gray-100" onClick={() => speak(st.ro)}>
                Ouvir
              </button>
              <input className="border rounded px-2 py-1 w-48" placeholder="Repita aqui" />
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex gap-2">
        <button
          className="px-3 py-2 rounded bg-green-600 text-white"
          onClick={() => {
            if (!done) {
              addPoints(12);
              setDone(true);
            }
          }}
        >
          Marcar missão como concluída
        </button>
        {done && <span className="text-sm text-green-700">Pontuação adicionada</span>}
      </div>
    </Card>
  );
}

function Checkpoint({ level, setLevel, addPoints }) {
  const [unitIdx, setUnitIdx] = useState(Number(localStorage.getItem(LS.unitIdx) || 0));
  const [score, setScore] = useState(Number(localStorage.getItem(LS.unitScore) || 0));
  const units = CURRICULUM[level];
  const unit = units[Math.min(unitIdx, units.length - 1)];
  useEffect(() => localStorage.setItem(LS.unitIdx, String(unitIdx)), [unitIdx]);
  useEffect(() => localStorage.setItem(LS.unitScore, String(score)), [score]);

  function mk() {
    const themeWords = unit.themes.flatMap((id) => THEMES.find((t) => t.id === id).words.map((w) => w.ro));
    const bank = [...CORE.map((w) => w.ro), ...themeWords];
    const ans = bank[ri(bank.length)];
    const opts = new Set([ans]);
    while (opts.size < 4) opts.add(bank[ri(bank.length)]);
    return { prompt: `Selecione: ${ans}`, ans, opts: [...opts].sort(() => Math.random() - 0.5) };
  }
  const [Q, setQ] = useState(mk());
  const [n, setN] = useState(0);

  function choose(o) {
    const ok = o === Q.ans;
    if (ok) {
      setScore((s) => s + 10);
      addPoints(5);
    }
    setN((x) => x + 1);
    if (n + 1 >= 10) {
      // finished; rely on pass button
    } else setQ(mk());
  }

  const passed = score >= unit.pass;

  return (
    <Card title="Checkpoint da unidade">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">
          {unit.name} · meta {unit.pass} pts
        </div>
        <div className="text-sm">{score} pts</div>
      </div>
      <div className="mt-3 text-center text-xl">{Q.prompt}</div>
      <div className="grid md:grid-cols-2 gap-2 mt-2">
        {Q.opts.map((o) => (
          <button key={o} onClick={() => choose(o)} className="px-3 py-2 rounded border">
            {o}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        {!passed && <div className="text-sm text-gray-600">Responda 10 questões. Cada acerto vale pontos.</div>}
        {passed && (
          <button
            className="px-3 py-2 rounded bg-blue-600 text-white"
            onClick={() => {
              setScore(0);
              setN(0);
              if (unitIdx < units.length - 1) setUnitIdx(unitIdx + 1);
              else {
                const i = LEVELS.indexOf(level);
                if (i < LEVELS.length - 1) setLevel(LEVELS[i + 1]);
                setUnitIdx(0);
              }
            }}
          >
            Avançar
          </button>
        )}
      </div>
    </Card>
  );
}

/* =========================================
   App
========================================= */
export default function App() {
  const { points, streak, goal, setGoal, addPoints } = useProgress();
  const [level, setLevel] = useState(localStorage.getItem(LS.level) || "A1");
  const [tab, setTab] = useState("home");
  useEffect(() => localStorage.setItem(LS.level, level), [level]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 text-slate-900">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        <Header level={level} setLevel={setLevel} />
        <Stats points={points} streak={streak} goal={goal} setGoal={setGoal} />

        <nav className="flex flex-wrap gap-2">
          {[
            { id: "home", label: "Início" },
            { id: "flash", label: "Flashcards" },
            { id: "quiz", label: "Quiz" },
            { id: "themes", label: "Temas" },
            { id: "missions", label: "Missões" },
            { id: "game", label: "Jogo" },
            { id: "culture", label: "Cultura" },
            { id: "trail", label: "Trilha" },
          ].map((b) => (
            <button key={b.id} onClick={() => setTab(b.id)} className={`px-3 py-2 rounded ${tab === b.id ? "bg-blue-600 text-white" : "bg-white"}`}>
              {b.label}
            </button>
          ))}
        </nav>

        {tab === "home" && (
          <div className="grid md:grid-cols-2 gap-4">
            <Flashcards level={level} addPoints={addPoints} />
            <div className="grid gap-4">
              <Quiz level={level} addPoints={addPoints} />
              <Culture addPoints={addPoints} />
            </div>
          </div>
        )}
        {tab === "flash" && <Flashcards level={level} addPoints={addPoints} />}
        {tab === "quiz" && <Quiz level={level} addPoints={addPoints} />}
        {tab === "themes" && <Themes addPoints={addPoints} />}
        {tab === "missions" && <Scenarios addPoints={addPoints} />}
        {tab === "game" && <Game addPoints={addPoints} />}
        {tab === "culture" && <Culture addPoints={addPoints} />}
        {tab === "trail" && <Checkpoint level={level} setLevel={setLevel} addPoints={addPoints} />}

        <Card title="Pronúncia & dicas">
          <p className="text-gray-700">
            Ouça ă â î e compare com vogais reduzidas do português. Repita em voz alta e use R vibrante. Clique nas palavras para TTS.
          </p>
          <div className="mt-3 grid md:grid-cols-2 gap-2">
            {CORE.slice(0, 7).map((w) => (
              <button key={w.ro} onClick={() => speak(w.ro)} className="px-3 py-2 rounded border flex justify-between">
                <span>
                  {w.ro} · {w.pt}
                </span>
                <span className="text-gray-500">{w.ipa}</span>
              </button>
            ))}
          </div>
        </Card>

        <footer className="text-center text-xs text-gray-500 py-6">Estudo pessoal. Dados ficam no navegador.</footer>
      </div>
    </div>
  );
}
