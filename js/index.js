
let useraddress;
let provider;
let signer;
let jpyccontract;

function walletmodal(){
    $('#wallet-popup').modal('show');
}


window.onload = async function() {
    ethereum.on('chainChanged', (_chainId) => window.location.reload());
    ChangeToMatic();
    Initmetamask();
}


async function Initmetamask(){
    
    if (window.ethereum !== undefined){
        SetMainMessage("Connected MetaMask");
    } else {
        SetMainMessage("Please open MetaMask");
    }

    provider = await new ethers.providers.Web3Provider(window.ethereum);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();    
    
    MakeJpycContract();
    MakeRiskPoolContract();
    MakeInvestedPoolContract();
}

async function MakeJpycContract(){
    jpyccontract = await new ethers.Contract( jpyc_on_fuji , JpycFuji_abi, signer );
    balance = await jpyccontract.balanceOf(userAddress) * 10e-19;
    document.getElementById("message").innerHTML += balance + "JPYC";
}

async function MakeRiskPoolContract(){
    riskPoolContract = await new ethers.Contract( riskPoolAddress , riskPool_abi, signer );
}


async function MakeInvestedPoolContract(){
    riskPoolContract = await new ethers.Contract( investedPoolAddress , riskPool_abi, signer );
}

async function Approve(){
    success = await jpyccontract.approve(userAddress, 10000000 * 10e+19);
    console.log(success);
    SetMainMessage("approve is " + success);
}

async function NewApplication(){
    newApp = await riskPoolContract.newApplication(100000 * 10e+19, 19, 1630130410);
    SetMainMessage("insurance contract: " + newApp);
}

async function ClaimInsurance(){
    claim = await riskPoolContract.claimInsurance(1);
    SetMainMessage("claim for insurance is: " + claim);
}

function SetMainMessage(message) {
    document.getElementById("message").innerHTML = message;
}

let a;

async function TokenPayment(){
    document.getElementById("message").innerHTML = "ボタンが押されました。お支払いを開始します";
    let options = { gasPrice: 10000000000 , gasLimit: 100000};
    const jpycprice = ethers.utils.parseUnits( pricing.toString() , 18);
    jpyccontract.transfer( shopwalletaddress , jpycprice , options ).catch((error) => {
    a=error;
    document.getElementById("message").innerHTML = error.code + "<br>" + error.message + "<br>" + error.stack + "<br>" + error.data + "<br>" + JSON.stringify(error);
    });
}

async function ChangeToMatic(){
    document.getElementById("message").innerHTML = "Please change network";
    let ethereum = window.ethereum;
    const data = [{
        chainId: '0xA869',
        chainName: 'Avalanche FUJI C-Chain',
        nativeCurrency:
            {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18
            },
        rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
        blockExplorerUrls: ['https://cchain.explorer.avax-test.network'],
    }]
        /* eslint-disable */
        const tx = await ethereum.request({method: 'wallet_addEthereumChain', params:data}).catch()
    document.getElementById("message").innerHTML = "準備ができました。お支払いボタンを押すと、お支払いできます<br><br>"
}
