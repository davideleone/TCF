// LogAspect.ts
import { Inject } from '@angular/core'
import { AdvicePool, adviceMetadata} from 'kaop-ts'
import { IMetadata } from '../app.interfaces'
import { JL } from 'jsnlog';

@Inject('JSNLOG')
export class LogAspect extends AdvicePool {
    
    static log(@adviceMetadata meta: IMetadata) {        
        JL().debug('Called: ' + meta.propertyKey.substring(0,255));
        JL().debug('Args: ' + meta.args.toString().substring(0,255));        
    }
    
    public logger : JL.JSNLog;
}

/*
SETTING GENERICI
import { beforeMethod } from 'kaop-ts';import { LogAspect } from '../helpers/logAspect';

@beforeMethod(LogAspect.log)//da posizionare sopra il method del service

SETTING AD-HOC
constructor


*/ 