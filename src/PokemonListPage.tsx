import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
type PokemonListItem = {
  name: string;
  url: string;
};
type PokemonListResponse = {
  count: number;
  results: PokemonListItem[];
  next: string | null;
};
type PokemonTypeResponse = {
  pokemon: {
    pokemon: PokemonListItem;
  }[];
};
type Pokemon = {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
  };
  types: {
    type: {
      name: string;
    };
  }[];
};
function PokemonListPage() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [pokemonTypes, setPokemonTypes] = useState<string[]>([]);
  const [typePokemonItems, setTypePokemonItems] = useState<PokemonListItem[]>(
    [],
  );
  const [loadedType, setLoadedType] = useState("");
  const [allPokemonItems, setAllPokemonItems] = useState<PokemonListItem[]>([]);
  const latestRequestedId = useRef(0);
  async function loadPokemons() {
    setIsLoading(true);
    latestRequestedId.current += 1;
    const requestId = latestRequestedId.current;
    setErrorMessage("");
    try {
      if (allPokemonItems.length === 0) {
        const typesResponse = await fetch(
          "https://pokeapi.co/api/v2/type?limit=100",
        );
        if (!typesResponse.ok) {
          throw new Error("Չհաջողվեց բեռնել տեսակները");
        }
        const typesData: PokemonListResponse = await typesResponse.json();

        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=1&offset=0",
        );
        if (!response.ok) {
          throw new Error("Չհաջողվեց բեռնել տվյալները");
        }
        const data: PokemonListResponse = await response.json();
        const fullListResponse = await fetch(
          `https://pokeapi.co/api/v2/pokemon?limit=${data.count}&offset=0`,
        );
        if (!fullListResponse.ok) {
          throw new Error("Չհաջողվեց բեռնել ամբողջ ցանկը");
        }
        const fullListData: PokemonListResponse = await fullListResponse.json();
        if (requestId !== latestRequestedId.current) {
          return;
        }
        setPokemonTypes(typesData.results.map((item) => item.name));
        setAllPokemonItems(fullListData.results);
        return;
      }
      if (selectedType !== "" && loadedType !== selectedType) {
        const typeResponse = await fetch(
          `https://pokeapi.co/api/v2/type/${selectedType}`,
        );
        if (!typeResponse.ok) {
          throw new Error("Չհաջողվեց բեռնել ընտրված տեսակի պոկեմոնները");
        }
        const typeData: PokemonTypeResponse = await typeResponse.json();
        if (requestId !== latestRequestedId.current) {
          return;
        }
        setTypePokemonItems(typeData.pokemon.map((item) => item.pokemon));
        setLoadedType(selectedType);
        return;
      }

      const detailedPokemons = await Promise.all(
        pageItems.map(async (item) => {
          const detailResponse = await fetch(item.url);
          if (!detailResponse.ok) {
            throw new Error("Չհաջողվեց բեռնել պոկեմոնի մանրամասները");
          }
          const details: Pokemon = await detailResponse.json();
          return details;
        }),
      );
      if (requestId !== latestRequestedId.current) {
        return;
      }

      setPokemons(detailedPokemons);
    } catch (error) {
      if (requestId !== latestRequestedId.current) {
        return;
      }

      console.error(error);
      setErrorMessage("Չհաջողվեց բեռնել պոկեմոնները։ Փորձիր նորից։");
    } finally {
      if (requestId === latestRequestedId.current) {
        setIsLoading(false);
      }
    }
  }
  useEffect(() => {
    loadPokemons();
    return () => {
      latestRequestedId.current += 1;
    };
  }, [
    offset,
    search,
    allPokemonItems,
    selectedType,
    typePokemonItems,
    loadedType,
  ]);
  const sourceItems = selectedType === "" ? allPokemonItems : typePokemonItems;
  const matchingItems = sourceItems.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const pageItems = matchingItems.slice(offset, offset + 20);
  return (
    <main>
      <h1>Pokédex</h1>
      <div className="filters">
        <label>
          Որոնել անունով
          <input
            type="search"
            placeholder="Օրինակ՝ bulbasaur"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setOffset(0);
            }}
          />
        </label>
        <label>
          Տեսակ
          <select
            value={selectedType}
            onChange={(event) => {
              setSelectedType(event.target.value);
              setOffset(0);
            }}
          >
            <option value="">Բոլոր տեսակները</option>
            {pokemonTypes.map((typeName) => (
              <option key={typeName} value={typeName}>
                {typeName}
              </option>
            ))}
          </select>
        </label>
      </div>
      {isLoading && <p>Բեռնվում է…</p>}
      {errorMessage && (
        <div role="alert">
          <p>{errorMessage}</p>
          <button onClick={loadPokemons}>Փորձել նորից</button>
        </div>
      )}
      {!isLoading && !errorMessage && matchingItems.length === 0 && (
        <p>Պոկեմոն չի գտնվել։ Փորձիր այլ անուն։</p>
      )}
      <ul className="pokemon-list">
        {pokemons.map((pokemon) => (
          <li key={pokemon.id}>
            <Link to={`/pokemon/${pokemon.id}`} className="pokemon-card">
              {pokemon.sprites.front_default && (
                <img src={pokemon.sprites.front_default} alt={pokemon.name} />
              )}
              <p>
                #{pokemon.id} {pokemon.name}
              </p>
              <p>{pokemon.types.map((item) => item.type.name).join(", ")}</p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="pagination">
        <button
          type="button"
          disabled={isLoading || offset === 0}
          onClick={() => setOffset((prevOffset) => prevOffset - 20)}
        >
          Նախորդը
        </button>
        <button
          type="button"
          disabled={isLoading || offset + 20 >= matchingItems.length}
          onClick={() => setOffset((prevOffset) => prevOffset + 20)}
        >
          Հաջորդը
        </button>
      </div>
    </main>
  );
}

export default PokemonListPage;
