import React, { useCallback, useState, useEffect, useRef } from 'react'
import { useRect } from '@reach/rect'
import styled from '@emotion/styled'
import { withApollo } from 'react-apollo'
import { SearchQuery } from '@solui/graphql'
import Router from 'next/router'
import { boxShadow } from '@solui/styles'
import { _, getNetworkInfoFromGlobalScope } from '@solui/utils'

import {
  Layout,
  NetworkContext,
  LoadingIcon,
  ErrorBox,
} from '@solui/react-components'

import Header from './Header'
import SearchResultsBox from './SearchResultsBox'

const StyledHeader = styled(Header)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  z-index: 1;
`

const Content = styled.div`
  width: 100%;
  margin-top: 100px;
`

const popupPositioning = ({ theme, rect }) => `
  background-color: ${theme.searchResultsPopupBackgroundColor};
  ${boxShadow({ color: theme.boxShadowColor })};
  position: fixed;
  z-index: 2;
  top: ${rect.top + 50}px;
  left: ${rect.left}px;
  width: ${rect.width}px;
  height: auto;
`

const StyledSearchResultsBox = styled(SearchResultsBox)`
  ${p => popupPositioning(p)};
`

const SearchProgressBox = styled.div`
  ${p => popupPositioning(p)};
`

let searchQueryTimer

const PageLayout = ({ client, children }) => {
  const [ results, setResults ] = useState(null)
  const [ searching, setSearching ] = useState(false)
  const [ searchText, setSearchText ] = useState('')
  const [ inputError, setInputError ] = useState()
  const [ page ] = useState(1)
  const searchInputRef = useRef(null)
  const searchInputRect = useRect(searchInputRef)
  const [ network, setNetwork ] = useState(null)

  const onSearchTextChange = useCallback(v => {
    setSearchText(v)
    setInputError(null)
  }, [ setSearchText, setInputError ])

  useEffect(() => {
    (async () => {
      try {
        const n = await getNetworkInfoFromGlobalScope()
        if (n && _.get(n, 'id') !== _.get(network, 'id')) {
          setNetwork(n)
        }
      } catch (err) {
        console.error(err)
        setNetwork(null)
      }
    })()
  }, [ network ])

  useEffect(() => {
    clearTimeout(searchQueryTimer)

    searchQueryTimer = setTimeout(async () => {
      setResults(null)

      if (!searchText) {
        return
      }

      setSearching(true)

      try {
        const { data: { search } } = await client.safeQuery({
          query: SearchQuery,
          fetchPolicy: 'network-only',
          variables: {
            criteria: {
              keyword: searchText,
              page,
            }
          }
        })

        setResults(search)
      } catch (err) {
        setResults({ error: err })
      } finally {
        setSearching(false)
      }
    }, 250 /* wait for user to stop typing */)
  }, [ client, searchText, page ])

  // hide search results popup when page changes
  useEffect(() => {
    Router.events.on('routeChangeStart', () => setResults(null))
  }, [/*  run once  */])

  return (
    <NetworkContext.Provider value={{ network }}>
      <Layout>
        <StyledHeader
          ref={searchInputRef}
          searchText={searchText}
          onSearchTextChange={onSearchTextChange}
        />
        {/* eslint-disable-next-line no-nested-ternary */}
        {searching ? (
          <SearchProgressBox rect={searchInputRect}>
            <LoadingIcon />
          </SearchProgressBox>
        ) : (
          /* eslint-disable-next-line no-nested-ternary */
          results ? (
            <StyledSearchResultsBox
              rect={searchInputRect}
              results={results}
              keyword={searchText}
            />
          ) : (
            inputError ? (
              <SearchProgressBox rect={searchInputRect}>
                <ErrorBox error={inputError} />
              </SearchProgressBox>
            ) : null
          )
        )}
        <Content>
          {children}
        </Content>
      </Layout>
    </NetworkContext.Provider>
  )
}

export default withApollo(PageLayout)
