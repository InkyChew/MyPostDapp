export interface IPost {
    postId: number;
    author: string;
    content: string;
    lastUpdated: number;
    allLovers: string[];
}

export interface IAuthor {
    totalPosts: number;
    hadPayoff: boolean;
}