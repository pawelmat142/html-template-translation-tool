export interface Dialog {
  open: Boolean,
  header: String,
  txt: String[],
  closeButtonInner: String,
  okButtons: string[]
}

export interface DialogButton { 
  inner: String,
  action: String,
}