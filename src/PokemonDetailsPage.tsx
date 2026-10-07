import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
type PokemonDetails = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: {
    type: {
      name: string;
    };
  }[];
  abilities: {
    ability: {
      name: string;
    };
  }[];
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
  sprites: {
    front_default: string | null;
  };
};
function PokemondetailsPage() {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const latestRequestedId = useRef(0);
  async function loadPokemon() {
    latestRequestedId.current += 1;
    const requestId = latestRequestedId.current;
    setIsLoading(true);
    setErrorMessage("");
    setPokemon(null);
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!response.ok) {
        throw new Error("Չհաջողվեց բեռնել պոկեմոնի տվյալները");
      }
      const data: PokemonDetails = await response.json();
      if (requestId !== latestRequestedId.current) {
        return;
      }
      setPokemon(data);
    } catch (error) {
      if (requestId !== latestRequestedId.current) {
        return;
      }
      console.error(error);
      setErrorMessage("Չհաջողվեց բեռնել պոկեմոնի տվյալները։ Փորձիր նորից։");
    } finally {
      if (latestRequestedId.current === requestId) {
        setIsLoading(false);
      }
    }
  }
  useEffect(() => {
    loadPokemon();
    return () => {
      latestRequestedId.current += 1;
    };
  }, [id]);
  return (
    <main className="details-page">
      <Link className="back-link" to={"/"}>
        Վերադառնալ ցուցակին
      </Link>
      {isLoading && <p>Բեռնվում է…</p>}
      {errorMessage && (
        <div role="alert">
          <p>{errorMessage}</p>
          <button type="button" onClick={loadPokemon}>
            Փորձել նորից
          </button>
        </div>
      )}
      {pokemon && (
        <section className="details-card">
          <div className="details-header">
            {pokemon.sprites.front_default && (
              <img
                className="details-image"
                src={pokemon.sprites.front_default}
                alt={pokemon.name}
              />
            )}

            <div>
              <p className="details-number">#{pokemon.id}</p>
              <h1>{pokemon.name}</h1>
            </div>
          </div>

          <dl className="details-facts">
            <div>
              <dt>Հասակ</dt>
              <dd>{pokemon.height / 10} մ</dd>
            </div>

            <div>
              <dt>Քաշ</dt>
              <dd>{pokemon.weight / 10} կգ</dd>
            </div>

            <div>
              <dt>Տեսակներ</dt>
              <dd>{pokemon.types.map((item) => item.type.name).join(", ")}</dd>
            </div>

            <div>
              <dt>Ունակություններ</dt>
              <dd>
                {pokemon.abilities.map((item) => item.ability.name).join(", ")}
              </dd>
            </div>
          </dl>

          <h2>Ցուցանիշներ</h2>

          <ul className="pokemon-stats">
            {pokemon.stats.map((item) => (
              <li key={item.stat.name}>
                <label>
                  <span className="stat-caption">
                    <span>{item.stat.name}</span>
                    <strong>{item.base_stat}</strong>
                  </span>
                  <meter min={0} max={255} value={item.base_stat} />
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

export default PokemondetailsPage;
