import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Listener, ethers } from 'ethers';
import { from, fromEvent } from 'rxjs';
import contractABI from "src/assets/LikePortal.json";
import { IAuthor, IPost } from '../models/post';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  ethereum = (window as any)?.ethereum;
  provider = new ethers.WebSocketProvider(environment.ALCHEMY_URL);
  contract = new ethers.Contract(environment.CONTRACT_ADDRESS, contractABI.abi, this.provider);

  constructor() { }

  isNetworkValid(): boolean {
    return this.ethereum?.chainId == environment.CHAINID;
  }

  switchNetwork() {
    return from(this.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: environment.CHAINID }],
    })); 
  }

  getWallet() {
    return from<Array<string>>(this.ethereum.request({
      method: "eth_accounts",
    }));
  }

  connectWallet() {
    return from<Array<string>>(this.ethereum.request({
      method: "eth_requestAccounts",
    }));
  }

  getAuthor(walletAddress: string) {    
    return from(this.contract['getAuthor'](walletAddress).then((a: IAuthor) => {
      return {
        totalPosts: a.totalPosts,
        hadPayoff: a.hadPayoff
      }
    }));
  }

  getAllPost() {
    return from(this.contract['getAllPost']().then((result: IPost[]) => {
      return result.map((p: IPost) => {
        return {
          postId: p.postId,
          author: p.author,
          content: p.content,
          lastUpdated: p.lastUpdated,
          allLovers: p.allLovers 
        }
      });
    }));
  }

  createPost(walletAddress: string, content: string) {
    const tx = {
      to: environment.CONTRACT_ADDRESS,
      from: walletAddress,
      data: this.contract.interface.encodeFunctionData('createPost', [content])
    };
    return from<string>(this.ethereum.request({
      method: "eth_sendTransaction",
      params: [tx],
    }));
  }

  updatePost(walletAddress: string, id: number, content: string) {
    const tx = {
      to: environment.CONTRACT_ADDRESS,
      from: walletAddress,
      data: this.contract.interface.encodeFunctionData('updatePost', [id, content])
    };
    return from<string>(this.ethereum.request({
      method: "eth_sendTransaction",
      params: [tx],
    }));
  }

  deletePost(walletAddress: string, id: number) {
    const tx = {
      to: environment.CONTRACT_ADDRESS,
      from: walletAddress,
      data: this.contract.interface.encodeFunctionData('deletePost', [id])
    };
    return from<string>(this.ethereum.request({
      method: "eth_sendTransaction",
      params: [tx],
    }));
  }

  like(walletAddress: string, id: number) {
    const tx = {
      to: environment.CONTRACT_ADDRESS,
      from: walletAddress,
      data: this.contract.interface.encodeFunctionData('like', [id])
    };
    return from<string>(this.ethereum.request({
      method: "eth_sendTransaction",
      params: [tx],
    }));
  }

  payoff(walletAddress: string) {
    const tx = {
      to: environment.CONTRACT_ADDRESS,
      from: walletAddress,
      data: this.contract.interface.encodeFunctionData('payoff')
    };
    return from<string>(this.ethereum.request({
      method: "eth_sendTransaction",
      params: [tx],
    }));
  }

  waitForTransaction(txHash: string) {
    return from(this.provider.waitForTransaction(txHash));
  }

  onNewPosts(cb: (posts: IPost[]) => void) {
    this.contract.on("newPosts", cb);
  }
  offNewPosts() {
    this.contract.off("newPosts");
  }

  onNewAuthor(cb: (aut: IAuthor) => void) {
    from(this.contract.on("newAuthor", cb));    
  }
  offNewAuthor() {
    this.contract.off("newAuthor");
  }
}
