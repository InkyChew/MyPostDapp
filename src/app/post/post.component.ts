import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IPost } from '../models/post';
import { ContractService } from '../services/contract.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  @Input() post!: IPost;
  showEditor: boolean = false;
  editable: boolean = false;

  @Output() onSave = new EventEmitter<IPost>();
  @Output() onDelete = new EventEmitter<IPost>();
  @Output() likeBtnClick = new EventEmitter<IPost>();

  constructor(private contractService: ContractService) {}

  ngOnInit(): void {}

  formatAddress(addr: string) {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length-4)}`;
  };

  formatTimestamp(tmsp: number): Date {
    return new Date(Number(tmsp.toString())*1000);
  }

  async setCtrl() {
    const walletAddress = await firstValueFrom(this.contractService.getWallet());
    this.editable = (this.post?.author.toLowerCase() == walletAddress[0]);
  }

  like() {
    this.likeBtnClick.emit(this.post);
  }

  save(content: string) {
    this.post.content = content;
    this.onSave.emit(this.post);
  }
  
  delete() {    
    this.onDelete.emit(this.post);
  }
}
