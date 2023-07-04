import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ContractService } from '../services/contract.service';
import { IAuthor, IPost } from '../models/post';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  @ViewChild('content') content!: ElementRef;

  Ethereum = this.contractService.ethereum;
  isNetworkValid = this.contractService.isNetworkValid();
  walletAddress?: string;
  stickers = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫"
  ];
  postList: IPost[] = [];
  author?: IAuthor;

  constructor(private contractService: ContractService) { }

  ngOnInit(): void {
    this.contractService.onNewPosts((posts: IPost[]) => this.postList = posts);
    this.contractService.onNewAuthor((aut: IAuthor) => this.author = aut);
    this.getWallet();
    this.getPostList();
  }

  switchNetwork() {
    this.contractService.switchNetwork().subscribe(() => this.isNetworkValid = this.contractService.isNetworkValid());
  }

  getWallet() {
    this.contractService.getWallet().subscribe(wallet => {
      this.walletAddress = wallet[0];      
      this.getAuthor();
    });
  }

  connectWallet() {
    this.contractService.connectWallet().subscribe(wallet => {
      this.walletAddress = wallet[0];
      this.getAuthor();
    });
  }

  getAuthor() {    
    if(this.walletAddress)
      this.contractService.getAuthor(this.walletAddress).subscribe(aut => this.author = aut)
  }

  getPostList() {
    this.contractService.getAllPost().subscribe(res => this.postList = res);
  }

  createPost(content: string) {
    if(this.walletAddress)
      this.contractService.createPost(this.walletAddress, content).subscribe(txHash => this.waitForTransaction(txHash));
  }

  updatePost(post: IPost) {    
    if(this.walletAddress)
      this.contractService.updatePost(this.walletAddress, post.postId, post.content).subscribe(txHash => this.waitForTransaction(txHash));
  }

  deletePost(post: IPost) {
    if(this.walletAddress)
      this.contractService.deletePost(this.walletAddress, post.postId).subscribe(txHash => this.waitForTransaction(txHash));
  }

  like(post: IPost) {
    if(this.walletAddress)
      this.contractService.like(this.walletAddress, post.postId).subscribe(txHash => this.waitForTransaction(txHash));
  }
  
  payoff() {
    if(this.walletAddress)
      this.contractService.payoff(this.walletAddress).subscribe(txHash => this.waitForTransaction(txHash));
  }

  waitForTransaction(txHash: string) {
    this.contractService.waitForTransaction(txHash).subscribe(res => {
      this.content.nativeElement.value = '';
      // console.log(res);
    });
  }

  ngOnDestroy() {
    this.contractService.offNewPosts();
    this.contractService.offNewAuthor();
  }
}
