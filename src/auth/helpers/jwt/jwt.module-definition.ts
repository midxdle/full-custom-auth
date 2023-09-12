import { ConfigurableModuleBuilder } from '@nestjs/common';
import { JwtModuleOptions } from './interfaces/module-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<JwtModuleOptions>()
    .setClassMethodName('forRoot')
    .build();
/**
 * This is a common pattern in NestJS for building reusable modules with configurable options.
 * the configurable module and returns an object with two properties:
 * ConfigurableModuleClass and MODULE_OPTIONS_TOKEN.
 *
 * ConfigurableModuleClass: This property holds the class of the configurable module.
 * It represents the module itself, which can be imported and used in other parts of the application.
 *
 * MODULE_OPTIONS_TOKEN: This property likely represents a token used for dependency injection.
 * It's common in NestJS to use tokens to provide module-specific options
 * or configuration to other parts of the application, such as providers or controllers.
 *
 *  import ConfigurableModuleClass to include the JWT module in application
 * and use the MODULE_OPTIONS_TOKEN for configuring the module's behavior
 * by providing options conforming to the JwtModuleOptions interface.
 */
