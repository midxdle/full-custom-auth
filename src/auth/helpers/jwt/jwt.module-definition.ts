import { ConfigurableModuleBuilder } from '@nestjs/common';
import { JwtModuleOptions } from './interfaces/module-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<JwtModuleOptions>()
    .setClassMethodName('forRoot')
    .build();
