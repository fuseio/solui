/* eslint-disable-next-line import/no-extraneous-dependencies */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import styled from '@emotion/styled'
import { _, createErrorWithDetails } from '@solui/utils'
import { flex, media, boxShadow, childAnchors } from '@solui/styles'

import { InterfaceBuilder } from './Interface'
import ErrorBox from './ErrorBox'
import MainnetWarning from './MainnetWarning'
import Progress from './Progress'
import Button from './Button'
import NetworkInfoLabel from './NetworkInfoLabel'
import Menu from './Menu'

const Container = styled.div`
  ${flex({ justify: 'center', align: 'center' })}
  padding: 2rem;
`

const InnerContainer = styled.div`
  background-color: ${({ theme }) => theme.interfaceBgColor};
  color: ${({ theme }) => theme.interfaceTextColor};
  border-radius: 5px;
  ${({ theme }) => boxShadow({ color: theme.interfaceShadowColor })};
`

const StyledProgress = styled(Progress)`
  margin: 1rem;
`

const StyledError = styled(ErrorBox)`
  margin: 1rem;
`

const StyledMainnetWarning = styled(MainnetWarning)`
  margin: 1rem auto 0;
  max-width: 80%;

  ${media.when({ minW: 'mobile' })} {
    max-width: 550px;
  }
`

const Preamble = styled.div`
  ${flex({ direction: 'column', justify: 'center', align: 'center' })};
  margin-bottom: 1rem;
`

const TopBar = styled.div`
  ${flex({ direction: 'row', justify: 'flex-end', align: 'center' })};
  padding: 0.5rem;
  text-align: right;
`

const BottomBar = styled.div`
  border-top: 1px dashed ${({ theme }) => theme.interfaceMenuBorderColor};
  margin-top: 3rem;
  padding: 2rem 0;
`

const StyledMenu = styled(Menu)`
  padding: 0 1.5rem;
  margin-bottom: 3rem;
`

const Credit = styled.p`
  ${({ theme }) => theme.font('body', 'thin')};
  text-align: center;
  color: ${({ theme }) => theme.creditTextColor};
  ${({ theme }) => childAnchors({
    textColor: theme.creditAnchorTextColor,
    hoverTextColor: theme.creditAnchorHoverTextColor,
    hoverBgColor: theme.creditAnchorHoverBgColor,
    borderBottomColor: theme.creditAnchorBorderBottomColor,
  })};
`

/**
 * Render a UI.
 * @return {ReactElement}
 */
const Dapp = ({
  network,
  spec,
  artifacts,
  className,
  validateSpec,
  processSpec,
  validatePanel,
  executePanel,
  embedUrl,
}) => {
  const [buildResult, setBuildResult] = useState()

  const [refreshCounter, setRefreshCounter] = useState(0)

  const account = useMemo(() => _.get(network, 'account'), [ network, refreshCounter ])

  const showMainnetWarning = useMemo(
    () => (_.get(network, 'id') == '1') && !_.get(spec, 'production'),
    [ spec, network ]
  )

  // validate a panel's inputs
  const onValidatePanel = useCallback(async ({ panelId, inputs }) => {
    if (!account) {
      throw new Error('Account not available')
    }

    return validatePanel({
      artifacts,
      spec,
      panelId,
      inputs,
      network,
    })
  }, [ spec, artifacts, network, validatePanel, account ])

  // execute a panel
  const onExecutePanel = useCallback(async ({ panelId, inputs, executionProgressCallback }) => {
    if (!account) {
      throw new Error('Account not available')
    }

    return executePanel({
      artifacts,
      spec,
      panelId,
      inputs,
      network,
      progressCallback: executionProgressCallback,
    })
  }, [ spec, artifacts, network, executePanel, account  ])

  // build interface
  useEffect(() => {
    if (!account) {
      return
    }

    (async () => {
      // assert validity
      try {
        await validateSpec({ spec, artifacts, network })
      } catch (err) {
        console.error(err)
        setBuildResult({ error: err })
        return
      }

      try {
        const int = new InterfaceBuilder()
        const { errors } = await processSpec({ spec, artifacts, network }, int)

        if (errors.notEmpty) {
          throw createErrorWithDetails('There were processing errors', errors.toStringArray())
        }

        setBuildResult({ interface: int })
      } catch (err) {
        console.error(err)
        setBuildResult({ error: err })
      }
    })()
  }, [ onValidatePanel, onExecutePanel, spec, artifacts, validateSpec, processSpec, network, account ])

  const enableAccountAccess = useCallback(async () => {
    await network.enableAccountAccess()
    setRefreshCounter(refreshCounter + 1)
  }, [ network, refreshCounter ])

  let content

  if (!network) {
    content = (
      <StyledProgress>Waiting for Ethereum network connection (please check your wallet / Metamask!)</StyledProgress>
    )
  } else if (!account) {
    content = (
      <Preamble>
        <StyledProgress>We need your permission to know your Ethereum account address</StyledProgress>
        <Button onClick={enableAccountAccess}>Enable access</Button>
      </Preamble>
    )
  } else {
    content = (
      <div>
        <TopBar>
          <NetworkInfoLabel network={network} />
        </TopBar>
        {showMainnetWarning ? (
          <StyledMainnetWarning>
            This Dapp has NOT been certified by the author for production use on the Ethereum Mainnet.
            Please be careful.
          </StyledMainnetWarning>
        ) : null}
        {/* eslint-disable-next-line no-nested-ternary */}
        {(!buildResult) ? <StyledProgress>Rendering...</StyledProgress> : (
          buildResult.error ? <StyledError error={buildResult.error} /> : (
            buildResult.interface.buildContent({
              onValidatePanel,
              onExecutePanel,
              showMainnetWarning,
            })
          )
        )}
        <BottomBar>
          <StyledMenu
            embedUrl={embedUrl}
            spec={spec}
            artifacts={artifacts}
          />
          <Credit>Powered by <a href="https://solui.dev">solUI</a></Credit>
        </BottomBar>
      </div>
    )
  }

  return (
    <Container className={className}>
      <InnerContainer>{content}</InnerContainer>
    </Container>
  )
}

export default Dapp
