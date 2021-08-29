var userAddress;
var provider;
var signer;
var jpycContract;
var riskPoolContract;
var investedPoolContract;

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

var accounts;

async function ConnectMetaMask() {
    accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    console.log(accounts);

    account = accounts[0];
    console.log(account);
}

async function onClickConnect() {
    try {
        const newAccounts = await ethereum.request({
            method: 'eth_requestAccounts',
        });

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
    riskPoolContract = await new ethers.Contract(riskPoolAddress,
        riskPool_abi, {
            from: accounts[0],
            gasPrice: 10,
            gas: 100000
        });
}


async function MakeInvestedPoolContract() {
    investedPoolContract = await new ethers.Contract(investedPoolAddress,
        investedPool_abi, {
            from: accounts[0],
            gasPrice: 10,
            gas: 100000
        });
}

async function Approve() {
    amount = document.getElementById("approve_amount").value;
    amount_e = Number(amount).toString(2);
    console.log(amount, amount_e);
    success = await jpycContract.approve(riskPoolAddress, amount_e);
    console.log(success);
    SetMainMessage("approve is ssuccess");

    UpdateCurrentJpyc();
}

async function NewApplication() {
    amount = document.getElementById("jpyc_value").value;
    console.log(amount);

    newApp = await riskPoolContract.newApplication(ToBin(amount), ToBin(19), ToBin(1630130410));
    SetMainMessage("insurance contract ssuccess");

    UpdateCurrentJpyc();
}

function ToBin(val) {
    return Number(val).toString(2);
}

async function ClaimInsurance() {
    amount = document.getElementById("claim_value").value;
    amount_e = Number(amount).toString(2);

    claim = await riskPoolContract.claimInsurance(amount_e);
    SetMainMessage("claim for insurance is ssuccess");
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