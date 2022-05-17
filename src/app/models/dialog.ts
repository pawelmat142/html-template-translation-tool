export interface Dialog {
  open: boolean,
  header: string,
  txt: string[],
  confirmFunction?: Function,
}

export interface DialogButton { 
  inner: String,
  action: String,
}