import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react"
import {
  Program,
  AnchorProvider,
  Idl,
  setProvider,
} from "@project-serum/anchor"
import { AnchorNftStaking, IDL as StakingIDL } from "./anchor_nft_staking"
import { Lootbox, IDL as LootboxIDL } from "./lootbox"
import { Connection, PublicKey } from "@solana/web3.js"
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import MockWallet from "./MockWallet"
import {
  STAKING_PROGRAM_ID,
  LOOTBOX_PROGRAM_ID,
  SBV2_DEVNET_PID,
} from "../../utils/constants"
import {
  AnchorWallet,
  loadSwitchboardProgram,
  OracleQueueAccount,
  PermissionAccount,
  ProgramStateAccount,
  VrfAccount,
  SwitchboardProgram,
} from "@switchboard-xyz/switchboard-v2"

const WorkspaceContext = createContext({})

interface WorkSpace {
  connection?: Connection
  provider?: AnchorProvider
  programStaking?: Program<AnchorNftStaking>
  programLootbox?: Program<Lootbox>
  programSwitchboard?: Program<Idl>
}

const WorkspaceProvider = ({ children }: any) => {
  const wallet = useAnchorWallet() || MockWallet
  const { connection } = useConnection()

  const provider = new AnchorProvider(connection, wallet, {})
  setProvider(provider)

  const [programSwitchboard, setProgramSwitchboard] = useState<any>()
  const programStaking = new Program(StakingIDL as Idl, STAKING_PROGRAM_ID)
  const programLootbox = new Program(LootboxIDL as Idl, LOOTBOX_PROGRAM_ID)

  let program = async function () {
    let response = await loadSwitchboardProgram(
      "devnet",
      connection,
      ((provider as AnchorProvider).wallet as AnchorWallet).payer
    )
    return response
  }

  // const test = useMemo(
  //   () =>
  //     program().then((result) => {
  //       setProgramSwitchboard(result)
  //     }),
  //   [wallet]
  // )
  // async function getProgram() {
  //   const switchboardProgram = await loadSwitchboardProgram(
  //     "devnet",
  //     connection,
  //     ((provider as AnchorProvider).wallet as AnchorWallet).payer
  //   )
  //   if (switchboardProgram) {
  //     return switchboardProgram
  //   }
  // }

  useEffect(() => {
    program().then((result) => {
      setProgramSwitchboard(result)
      console.log("result", result)
    })
  }, [connection, wallet])

  // const programSwitchboard = new Program(
  //   SwitchboardIDL as unknown as Idl,
  //   SBV2_DEVNET_PID
  // )

  var workspace = {
    connection,
    provider,
    programStaking,
    programLootbox,
    programSwitchboard,
  }

  console.log(workspace)

  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  )
}

const useWorkspace = (): WorkSpace => {
  return useContext(WorkspaceContext)
}

export { WorkspaceProvider, useWorkspace }
