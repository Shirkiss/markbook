import React, { useState } from 'react'
import * as FaIcons from 'react-icons/fa'
import styled from 'styled-components'

const Search = styled.div`
     display: flex;
     -webkit-box-align: center;
     align-items: center;
     width: 55%;
     height: 27px;
     border-radius: 16px;
     background: rgb(255, 255, 255);
     margin: 10px 25px 0px 10px;
     box-shadow: none;
     border: 1px solid rgb(81 84 89);
     padding-left: 10px;
`

const Input = styled.input`
       outline: none;
       border: none;
       margin-left: 3px;
       &:focus {
        outline: none;
      }
`

const SearchBox: React.FunctionComponent<{onSearchChange:Function}> = ({onSearchChange}) => {
   const [search, setSearch] = useState<string>('');

    let handleChange = (event:any) => {
        setSearch(event.target.value)
        if (event.target.value.length > 1 || event.target.value.length == 0) {
           onSearchChange(event.target.value)
        }
    }

    return (
        <>
            <Search><FaIcons.FaSearch size={20}/>
                <Input type="text" className="search_input" id="search" value={search}
                       onChange={handleChange}/>
            </Search>
        </>
    )
}

export default SearchBox