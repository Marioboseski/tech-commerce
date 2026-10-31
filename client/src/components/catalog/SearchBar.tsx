import type { FormEvent } from 'react';
type Props={query:string;onQueryChange:(query:string)=>void;onSubmit:(event:FormEvent)=>void};
export default function SearchBar({query,onQueryChange,onSubmit}:Props){return <form className="search-form" onSubmit={onSubmit}><span>⌕</span><input value={query} onChange={event=>onQueryChange(event.target.value)} placeholder="Search laptops, smartphones, tablets..." aria-label="Search products"/><button className="search-button">Search</button></form>}
