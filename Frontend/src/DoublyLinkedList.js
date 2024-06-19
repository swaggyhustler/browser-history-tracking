class Node {
    constructor(url) {
        this.url = url;
        this.prev = null;
        this.next = null;
    }
}

class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.current = null;
    }

    add(url) {
        const newNode = new Node(url);
        if (!this.head) {
            this.head = this.tail = newNode;
        } else {
            newNode.prev = this.tail;
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this.current = newNode;
    }

    getCurrentUrl() {
        return this.current ? this.current.url : null;
    }

    goBack() {
        if (this.current && this.current.prev) {
            this.current = this.current.prev;
        }
        return this.getCurrentUrl();
    }

    goForward() {
        if (this.current && this.current.next) {
            this.current = this.current.next;
        }
        return this.getCurrentUrl();
    }

    reset() {
        this.head = null;
        this.tail = null;
        this.current = null;
    }
}

export default DoublyLinkedList;
