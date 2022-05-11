import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tittlecase'
})
export class TittlecasePipe implements PipeTransform {

  transform(value:String): String {
    let first = value.substr(0,1).toUpperCase();
    return first + value.substr(1); 
  }

}
