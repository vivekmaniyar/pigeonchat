import React from 'react';
import { SearchBar, Carousel, SearchContext } from '@giphy/react-components';
import { useContext } from 'react';

const Gifmodal = ({onGifClick}) => {
    const { fetchGifs, searchKey } = useContext(SearchContext)
    return (
        <div style={{width:"100%"}}>
            <SearchBar />
            {/** 
                key will recreate the component, 
                this is important for when you change fetchGifs 
                e.g. changing from search term dogs to cats or type gifs to stickers
                you want to restart the gifs from the beginning and changing a component's key does that 
            **/}
            <Carousel key={searchKey} columns={3} width={"100px"} fetchGifs={fetchGifs} gifHeight={200} onGifClick={onGifClick}/>
        </div>
    )
}

export default Gifmodal;
