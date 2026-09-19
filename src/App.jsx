import { useEffect, useMemo, useState } from 'react';
import { computeStats } from './lib/stats.js';
import { buildNews } from './lib/news.js';
import { loadClausulazos, loadCronicas, deleteClausulazo, savedPassword } from './lib/api.js';
import { fmtEur, fmtM, fmtSignedM, fmtFecha, haceCuanto } from './lib/format.js';
import { HERO_LINES, pickBy, pluralClaus } from './lib/copy.js';
import { Manager } from './components/Badge.jsx';
import Standings from './components/Standings.jsx';
import Awards from './components/Awards.jsx';
import News from './components/News.jsx';
import Diario from './components/Diario.jsx';
import Matrix from './components/Matrix.jsx';
import Timeline from './components/Timeline.jsx';
import Profile from './components/Profile.jsx';
import History from './components/History.jsx';
import AdminPanel from './components/AdminPanel.jsx';

function Section({ id, title, intro, children }) {
  return (
    <section id={id} className="section">
      <header className="section-head">
        <h2>{title}</h2>
        {intro && <p>{intro}</p>}
      </header>
      {children}
    </section>
  );
}

export default function App() {
  const [list, setList] = useState(null);
  const [online, setOnline] = useState(true);
  const [offlineMsg, setOfflineMsg] = useState('');
  const [password, setPassword] = useState(savedPassword.get());
  const [panelOpen, setPanelOpen] = useState(false);
  const [cronicas, setCronicas] = useState([]);

  useEffect(() => {
    loadClausulazos().then(({ data, online: ok, message }) => {
      setList(data);
      setOnline(ok);
      setOfflineMsg(message);
    });
    loadCronicas().then(setCronicas);
  }, []);

  const stats = useMemo(() => (list ? computeStats(list) : null), [list]);
  const news = useMemo(() => (stats ? buildNews(stats) : { items: [] }), [stats]);

  const login = (pw) => {
    savedPassword.set(pw);
    setPassword(pw);
  };
  const logout = () => {
    savedPassword.set('');
    setPassword('');
  };

  async function handleDelete(c) {
    if (!window.confirm(`¿Borrar el clausulazo de ${c.jugador} (${c.vendedor} a ${c.comprador})?`)) return;
    try {
      setList(await deleteClausulazo(password, c.id));
    } catch (err) {
      if (err.status === 401) logout();
      window.alert(err.message);
    }
  }

  if (!stats) {
    return (
      <main className="loading" aria-busy="true">
        <p>Revisando el VAR…</p>
      </main>
    );
  }

  const u = stats.ultimo;
  const implicados = stats.managers.filter((m) => m.hechos > 0).length;

  return (
    <>
      <header className="topbar">
        <a href="#top" className="brand">
          <span className="brand-name">Clausoremeter</span>
          <span className="brand-league">Enjumenis League</span>
        </a>
        <nav className="nav" aria-label="Secciones">
          <a href="#premios">Premios</a>
          <a href="#noticias">Noticias</a>
          <a href="#diario">Diario</a>
          <a href="#clasificacion">Clasificación</a>
          <a href="#taquilla">Taquilla</a>
          <a href="#rencor">Rencor</a>
          <a href="#acta">Acta</a>
        </nav>
        <button type="button" className="btn-primary" onClick={() => setPanelOpen(true)}>
          {password ? 'Apuntar clausulazo' : 'Zona del delegado'}
        </button>
      </header>

      {!online && <p className="banner">Modo solo lectura con los datos iniciales. {offlineMsg}</p>}

      <main id="top">
        <section className="hero">
          {u ? (
            <div className="hero-inner">
              <p className="hero-kicker">
                Último clausulazo, {haceCuanto(u.fecha)}
              </p>
              <h1 className="hero-player">{u.jugador}</h1>
              <div className="hero-route">
                <Manager name={u.vendedor} size="lg" />
                <span className="hero-arrow" aria-label="pasa a">
                  ➜
                </span>
                <Manager name={u.comprador} size="lg" />
              </div>
              <p className="hero-amount">{fmtEur(u.importe)}</p>
              <p className="hero-line">{pickBy(u.id, HERO_LINES)(u)}</p>
            </div>
          ) : (
            <div className="hero-inner">
              <h1 className="hero-player">Mercado en calma</h1>
              <p className="hero-line">Nadie ha pagado una cláusula todavía. Sospechoso.</p>
            </div>
          )}

          <dl className="scoreboard" aria-label="Marcador de la liga">
            <div>
              <dt>Clausulazos</dt>
              <dd>{stats.total}</dd>
            </div>
            <div>
              <dt>Dinero movido</dt>
              <dd>{fmtM(stats.dinero)}</dd>
            </div>
            <div>
              <dt>Precio medio</dt>
              <dd>{fmtM(stats.media, 2)}</dd>
            </div>
            <div>
              <dt>Mánagers con las manos manchadas</dt>
              <dd>
                {implicados}
                <small>/{stats.managers.length}</small>
              </dd>
            </div>
          </dl>
        </section>

        <Section id="premios" title="Tarjetas y trofeos" intro="Seis tarjetas para los que mandan en el mercado. Amarilla para los que hacen daño, roja para los que lo sufren.">
          <Awards stats={stats} />
        </Section>

        <Section
          id="noticias"
          title="La portada de la semana"
          intro={
            news.items.length
              ? `Lo que ha pasado entre el ${fmtFecha(news.desde)} y el ${fmtFecha(news.hasta)}${
                  news.reciente ? '' : ', que es la última semana con movimiento'
                }.`
              : 'Aquí aparecerán los titulares en cuanto alguien vuelva a pagar una cláusula.'
          }
        >
          <News news={news} />
        </Section>

        <Section
          id="diario"
          title="El Diario de la Enjumenis"
          intro="La crónica de la jornada, el salseo, los vaticinios y el uno por uno. Escrito a mano, sin piedad."
        >
          <Diario cronicas={cronicas} />
        </Section>

        <Section id="clasificacion" title="Clasificación del clausulazo" intro="Quién roba y a quién le roban. El que tenga un cero puede presumir, de momento.">
          <div className="two-col">
            <Standings
              title="Hechos"
              note="Clausulazos pagados"
              rows={stats.rankings.hechos}
              valueKey="hechos"
              format={(v) => v}
              sub={(r) => (r.gastado ? fmtM(r.gastado) : '')}
              tone="yellow"
            />
            <Standings
              title="Recibidos"
              note="Jugadores que le han quitado"
              rows={stats.rankings.recibidos}
              valueKey="recibidos"
              format={(v) => v}
              sub={(r) => (r.cobrado ? fmtM(r.cobrado) : '')}
              tone="red"
            />
          </div>
        </Section>

        <Section id="taquilla" title="La taquilla" intro="Lo que se ha gastado cada uno, lo que ha cobrado sin querer y cómo queda la cuenta.">
          <div className="three-col">
            <Standings title="Gastado" note="El club de los talonarios" rows={stats.rankings.gastado} valueKey="gastado" format={(v) => fmtM(v)} tone="yellow" />
            <Standings title="Cobrado" note="Dinero de consolación" rows={stats.rankings.cobrado} valueKey="cobrado" format={(v) => fmtM(v)} tone="red" />
            <Standings
              title="Balance neto"
              note="Cobrado menos gastado"
              rows={stats.rankings.balance}
              valueKey="balance"
              format={fmtSignedM}
              tone="chalk"
              diverging
            />
          </div>
        </Section>

        <Section
          id="rencor"
          title="La matriz del rencor"
          intro="Cada fila es quien paga, cada columna a quien se lo hace. Cuanto más rojo, más personal."
        >
          <Matrix stats={stats} />
        </Section>

        <Section id="calendario" title="Calendario de atracos" intro={`${pluralClaus(stats.total)} repartidos por días. Mediana: ${fmtM(stats.mediana, 2)} por cláusula.`}>
          <Timeline timeline={stats.timeline} />
        </Section>

        <Section id="ficha" title="Ficha del mánager" intro="Para señalar con nombre y apellidos.">
          <Profile stats={stats} />
        </Section>

        <Section id="acta" title="Acta del mercado" intro="Todos los clausulazos, del más reciente al más antiguo.">
          <History list={stats.list} isAdmin={Boolean(password) && online} onDelete={handleDelete} />
        </Section>
      </main>

      <footer className="footer">
        <p>Clausoremeter de la Enjumenis League. Los clausulazos los apunta el delegado; las lágrimas, cada uno en su casa.</p>
      </footer>

      <AdminPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        password={password}
        onLogin={login}
        onLogout={logout}
        online={online}
        list={stats.list}
        onData={setList}
        cronicas={cronicas}
        onCronicas={setCronicas}
      />
    </>
  );
}
