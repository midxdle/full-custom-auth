import { Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './jwt.module-definition';
import { CryptoModule } from '../crypto/crypto.module';
import { jwtModuleOptions } from './interfaces/module-options.interface';

@Global()
@Module({
  imports: [CryptoModule],
  providers: [
    JwtService,
    { provide: MODULE_OPTIONS_TOKEN, useValue: jwtModuleOptions },
  ],
  exports: [JwtService],
})
export class JwtModule extends ConfigurableModuleClass {}
