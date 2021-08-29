var userAddress;
var provider;
var signer;
var jpycContract;

function walletmodal() {
    $('#wallet-popup').modal('show');
}


window.onload = async function() {
    ethereum.on('chainChanged', (_chainId) => window.location.reload());
    await ChangeToMatic();
    Initmetamask();
}


async function Initmetamask() {

    if (window.ethereum !== undefined) {
        SetMainMessage("Connected MetaMask");
    } else {
        SetMainMessage("Please open MetaMask");
    }

    await ConnectMetaMask();

    provider = await new ethers.providers.Web3Provider(window.ethereum);
    console.log(provider);

    signer = await provider.getSigner();
    console.log(signer);

    userAddress = await signer.getAddress();
    console.log(userAddress);

    MakeJpycContract();
    MakeRiskPoolContract();
    MakeInvestedPoolContract();
}

async function ConnectMetaMask() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    console.log(accounts);

    const account = accounts[0];
    console.log(account);
}

async function onClickConnect() {
    try {
        //アカウントへの接続を要求
        const newAccounts = await ethereum.request({
            method: 'eth_requestAccounts',
        })
        console.log(newAccounts);
    } catch (error) {
        console.error(error);
    }
};

async function MakeJpycContract() {
    jpycContract = await new ethers.Contract(jpyc_on_fuji, JpycFuji_abi, signer);
    console.log(jpycContract);

    UpdateCurrentJpyc();
}

async function UpdateCurrentJpyc() {
    balance = await jpycContract.balanceOf(userAddress) * 10e-19;
    console.log(balance);

    document.getElementById("message").innerHTML += balance + "JPYC";
}

async function MakeRiskPoolContract() {
    riskPoolContract = await new ethers.Contract(riskPoolAddress, riskPool_abi, signer);
}


async function MakeInvestedPoolContract() {
    riskPoolContract = await new ethers.Contract(investedPoolAddress, riskPool_abi, signer);
}

async function Approve() {
    amount = document.getElementById("approve_amount")
    amount_e = Number(amount).toString(2);
    success = await jpycContract.approve(riskPoolAddress, amount_e);
    console.log(success);
    SetMainMessage("approve is " + success);

    UpdateCurrentJpyc();
}

async function NewApplication() {
    amount = document.getElementById("jpyc_value")
    amount_e = ethers.BigNumber.from(amount);
    id_e = ethers.utils.parseEther(19);
    currentTime = ethers.utils.parseEther(1630130410);

    console.log(amount, amount_e, id_e, currentTime);

    newApp = await riskPoolContract.newApplication(amount_e, id_e, currentTime);
    SetMainMessage("insurance contract: " + newApp);

    UpdateCurrentJpyc();
}

async function ClaimInsurance() {
    claim = await riskPoolContract.claimInsurance(ethers.BigNumber.from(1));
    SetMainMessage("claim for insurance is: " + claim);
}

function SetMainMessage(message) {
    document.getElementById("message").innerHTML = message + "<br>";
}

async function ChangeToMatic() {
    document.getElementById("message").innerHTML = "Please change network";
    let ethereum = window.ethereum;
    const data = [{
            chainId: '0xA869',
            chainName: 'Avalanche FUJI C-Chain',
            nativeCurrency: {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18
            },
            rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
            blockExplorerUrls: ['https://cchain.explorer.avax-test.network'],
        }]
        /* eslint-disable */
    const tx = await ethereum.request({ method: 'wallet_addEthereumChain', params: data }).catch();

    SetMainMessage("Could connect your wallet. You can make contract with our Insurance.<br> <br>");
}