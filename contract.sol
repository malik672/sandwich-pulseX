//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUniswapV2Pair {
    function balanceOf(address owner) external view returns (uint256);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function totalSupply() external view returns (uint256);

    function approve(address spender, uint256 value) external returns (bool);

    function transfer(address to, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);

    function factory() external view returns (address);

    function token0() external view returns (address);

    function token1() external view returns (address);

    function getReserves()
        external
        view
        returns (
            uint112 reserve0,
            uint112 reserve1,
            uint32 blockTimestampLast
        );

    function price0CumulativeLast() external view returns (uint256);

    function price1CumulativeLast() external view returns (uint256);

    function kLast() external view returns (uint256);
}

interface IUniswapV2Router02 {
    function factory() external pure returns (address);

    function getAmountsOut(uint256 amountIn, address[] memory path)
        external
        view
        returns (uint256[] memory amounts);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
        external
        returns (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidity
        );

    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    )
        external
        payable
        returns (
            uint256 amountToken,
            uint256 amountETH,
            uint256 liquidity
        );

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB);

    function removeLiquidityETH(
        address tokenA,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB);

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB)
        external
        view
        returns (address pair);
}

interface IWETH {
    function deposit() external payable;

    function withdraw(uint256 amount) external;
}

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
}

contract sandwich {
    address public constant UNISWAP_ROUTER_ADDRESS =
        0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02;

    address public constant WETH9 = 0xA1077a294dDE1B09bB078844df40758a5D0f9a27;
    IUniswapV2Router02 public uniswapRouter;
    IUniswapV2Factory public uniswapFactory;
    IWETH private weth;
    address public owner;

    constructor() {
        uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
        uniswapFactory = IUniswapV2Factory(
            0x1715a3E4A142d8b698131108995174F37aEBA10D
        );
        weth = IWETH(WETH9);
        owner = msg.sender;
    }

    function swapWETHToToken(
        address tokenA,
        address tokenB,
        uint amountbuy
    ) external {
        // Approve the Uniswap Router to spend tokenA on behalf of this contract
        IERC20(tokenA).approve(UNISWAP_ROUTER_ADDRESS, IERC20(tokenA).balanceOf(address(this)));

        // Approve the Uniswap Router to spend Tokens on behalf of this contract
        IERC20(tokenB).approve(UNISWAP_ROUTER_ADDRESS, IERC20(tokenA).balanceOf(address(this)));

        //Split contract TokenA balance and Swap
        //Spilt into 3

        address[] memory path = new address[](2);
        path[0] = tokenA;
        path[1] = tokenB;

        uint256 deadline = block.timestamp + 600; // 10 minute deadline
        uint balance = IERC20(tokenA).balanceOf(address(this));
        uint256 amountOutMin = getMinAmount(amountbuy, tokenA, tokenB);

        // uint256 amountOut = calculateMinAmountOut(amountOutMin, 0);// 1% Max Slippage

        // Perform the swap from TokenA to TokenB for w1
        uniswapRouter.swapExactTokensForTokens(
            amountbuy,
            amountOutMin,
            path,
            address(this),
            deadline
        );

        // Set allowance to 0
        IERC20(tokenA).approve(UNISWAP_ROUTER_ADDRESS, 0);

        // Set allowance to 0
        IERC20(tokenB).approve(UNISWAP_ROUTER_ADDRESS, 0);
    }

    function swapWETHToTokens(
        address tokenA,
        address tokenB
    ) external {
        // Approve the Uniswap Router to spend tokenA on behalf of this contract
        IERC20(tokenA).approve(UNISWAP_ROUTER_ADDRESS, IERC20(tokenA).balanceOf(address(this)));

        // Approve the Uniswap Router to spend Tokens on behalf of this contract
        IERC20(tokenB).approve(UNISWAP_ROUTER_ADDRESS, IERC20(tokenA).balanceOf(address(this)));

        //Split contract TokenA balance and Swap
        //Spilt into 3

        address[] memory path = new address[](2);
        path[0] = tokenA;
        path[1] = tokenB;

        uint256 deadline = block.timestamp + 600; // 10 minute deadline
        uint balance = IERC20(tokenA).balanceOf(address(this));
        uint256 amountOutMin = getMinAmount(balance, tokenA, tokenB);

        // uint256 amountOut = calculateMinAmountOut(amountOutMin, 0);// 1% Max Slippage

        // Perform the swap from TokenA to TokenB for w1
        uniswapRouter.swapExactTokensForTokens(
            balance,
            amountOutMin,
            path,
            address(this),
            deadline
        );

        // Set allowance to 0
        IERC20(tokenA).approve(UNISWAP_ROUTER_ADDRESS, 0);

        // Set allowance to 0
        IERC20(tokenB).approve(UNISWAP_ROUTER_ADDRESS, 0);
    }

    function emergencyWithdrawEveryone(address _token) external {
        uint256 balance = address(this).balance;
        payable(owner).transfer(balance);
        balance = IERC20(_token).balanceOf(address(this));

        IERC20(_token).transfer(owner, balance);
    }

    function getMinAmount(
        uint256 amountIn,
        address _tokenIn,
        address _tokenOut
    ) public view returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        uint256[] memory amountsOut = uniswapRouter.getAmountsOut(
            amountIn,
            path
        );
        return amountsOut[1];
    }
}
