# [1.8.0](https://github.com/bcgov/cas-cif/compare/1.7.2...1.8.0) (2023-05-16)

### Bug Fixes

- fix migration equality in-place ([ee4e09c](https://github.com/bcgov/cas-cif/commit/ee4e09c7b07dd12a36092460b62c64f037f51f4e))
- fix milestone calculations when changing milestone type ([0bc4c7d](https://github.com/bcgov/cas-cif/commit/0bc4c7d482dba90fc6a6bbd725d5ea7ba67659e0))
- fix selecting the wrong funding stream id for external users ([952eae8](https://github.com/bcgov/cas-cif/commit/952eae81dc47b10637abf96bd5ae92c639c66b39))
- integer cast should be numeric ([6708c2d](https://github.com/bcgov/cas-cif/commit/6708c2d97f8ba029b1d966f51c3fd6dcb2706fa4))
- not using hardcoded rfp ID ([8e5b5af](https://github.com/bcgov/cas-cif/commit/8e5b5af0a104f43cac30d5e33d293da55ab830f6))
- set default value for options in widget when no schema.anyOf ([ea0c8c3](https://github.com/bcgov/cas-cif/commit/ea0c8c3fc697ddb2eaa9fe7befe039e8355407ab))
- show emission intensity data on view mode ([3627617](https://github.com/bcgov/cas-cif/commit/3627617344b8f9257b273f8c2c3b8461c9846969))
- update_form_change now handles the case when form data operator is null and form is currently archived. Sets it to updated. ([a2a8c95](https://github.com/bcgov/cas-cif/commit/a2a8c95342ffb92a0cc76ed70ef97006735cfb6f))

### Features

- add project_attachment table ([5ed430b](https://github.com/bcgov/cas-cif/commit/5ed430bedc9892b74b62d7b7e164a9dc3db3e628))
- redirect to editable forms from open amendment ([90489b8](https://github.com/bcgov/cas-cif/commit/90489b859d222a0eb35f530de5a1a68a6dd0eebd))
- show calculated value diffs on overview summary ([0cde36e](https://github.com/bcgov/cas-cif/commit/0cde36efa820557f669f4b0c5b4b57ea80809175))

## [1.7.3](https://github.com/bcgov/cas-cif/compare/1.7.2...1.7.3) (2023-05-02)

### Bug Fixes

- fix migration equality in-place ([ee4e09c](https://github.com/bcgov/cas-cif/commit/ee4e09c7b07dd12a36092460b62c64f037f51f4e))
- set default value for options in widget when no schema.anyOf ([ea0c8c3](https://github.com/bcgov/cas-cif/commit/ea0c8c3fc697ddb2eaa9fe7befe039e8355407ab))

## [1.7.2](https://github.com/bcgov/cas-cif/compare/1.7.1...1.7.2) (2023-04-27)

### Bug Fixes

- rework migration function to fix equality check of migrated data ([469cdd9](https://github.com/bcgov/cas-cif/commit/469cdd908c4f3b975c6563ba977980abdd1c7ace))

## [1.7.1](https://github.com/bcgov/cas-cif/compare/1.7.0...1.7.1) (2023-04-27)

### Bug Fixes

- change sqitch plan order to fix additional funding sources migration ([360ae0c](https://github.com/bcgov/cas-cif/commit/360ae0c79a096d17290f61d4d747a3a592affd84))

# [1.7.0](https://github.com/bcgov/cas-cif/compare/1.6.0...1.7.0) (2023-04-26)

### Bug Fixes

- adding proper rfp ui ([978b838](https://github.com/bcgov/cas-cif/commit/978b8380c86a0712d26a50526a1fd6c4c8d42d7a))
- new project rfp select ([6b6a7c0](https://github.com/bcgov/cas-cif/commit/6b6a7c07487f50ec74a6cadb9e13260289704ac4))
- show expenses tracker on review and submit page ([bd5df5b](https://github.com/bcgov/cas-cif/commit/bd5df5b0f776ab49b4c18ae1bfb7f36385c9bcf6))

### Features

- calculate gross amount based on report type and received date and total eligible expenses ([5e6f73e](https://github.com/bcgov/cas-cif/commit/5e6f73e675100c1170097942f2f234a3981a5cba))
- calculate holdback amount based on report type and received date and total eligible expenses ([1848331](https://github.com/bcgov/cas-cif/commit/184833187f4a2af106d388dc1366360fff60ce98))
- calculate net amount based on report type and received date and total eligible expenses ([1fc6335](https://github.com/bcgov/cas-cif/commit/1fc633546c9981d2bbf50a735c4867af043217f6))
- calculate total payment amount to date for ia project funding form using computed column ([1f6254e](https://github.com/bcgov/cas-cif/commit/1f6254ea9e14552d4c34f4e14b0e75b148fc1a0d))
- commit revision when status is Applied ([0c7f7ea](https://github.com/bcgov/cas-cif/commit/0c7f7eab440a7c3187261e9ad104a3b5a7d3622e))
- create application form structure, component, and routes ([f7ed709](https://github.com/bcgov/cas-cif/commit/f7ed709f9b681f668d5d0667530b5d1504ac8230))
- external operator review page ([0ae491f](https://github.com/bcgov/cas-cif/commit/0ae491fd7f309e3bd97642ba4b0a24693371f61c))
- renew ssl cert automatically with shipit ([7acccfe](https://github.com/bcgov/cas-cif/commit/7acccfebb3d97229d0bf9888f8a77701c1194e92))
- revision type list only allows options that are not already in progress ([a79e7aa](https://github.com/bcgov/cas-cif/commit/a79e7aacfc7b8fa9501f35487bff9a0b83f42669))
- show overwrite notifications in diffs ([6103241](https://github.com/bcgov/cas-cif/commit/610324199ea4d5c06a9906bfa5a56ee6f93645b3))

# [1.6.0](https://github.com/bcgov/cas-cif/compare/1.5.3...1.6.0) (2023-03-29)

### Features

- add dependency to milestone schema ([6bc5ad8](https://github.com/bcgov/cas-cif/commit/6bc5ad806a31d7dc5589b9dd7e10806ef2e444af))
- create project summary report summary page ([7868dcf](https://github.com/bcgov/cas-cif/commit/7868dcfdaf8044a6a110ed0bd28022db5f4f3fe2))

## [1.5.3](https://github.com/bcgov/cas-cif/compare/1.5.2...1.5.3) (2023-03-21)

### Bug Fixes

- fix the issue with not saving zero values ([376a944](https://github.com/bcgov/cas-cif/commit/376a944565e2ebe8c22c1e1cad885927e3dfd6cf))

### Features

- add external project overview ([d8d54cc](https://github.com/bcgov/cas-cif/commit/d8d54cc6826a8513dbd33559dfed881ace57aa0c))
- set the Payment Percentage of Performance Milestone Amount between 0 and 100% ([f7663e7](https://github.com/bcgov/cas-cif/commit/f7663e7cd70e8586cc6f85dc3b0980d8291e2f22))

## [1.5.2](https://github.com/bcgov/cas-cif/compare/1.5.1...1.5.2) (2023-03-07)

## [1.5.1](https://github.com/bcgov/cas-cif/compare/1.5.0...1.5.1) (2023-03-06)

### Bug Fixes

- fix funding_form_changes_to_separate_schemas migration ([c6a3340](https://github.com/bcgov/cas-cif/commit/c6a3340dee8439b5af9d20adf315d3d51d7f987d))

# [1.5.0](https://github.com/bcgov/cas-cif/compare/1.4.1...1.5.0) (2023-03-03)

### Bug Fixes

- correct Actual Performance Milestone Amount calculation ([9877be4](https://github.com/bcgov/cas-cif/commit/9877be429451fd73a47dac22c7650c34d4bbf57c))

### Features

- add EP/IA schemas to funding form ([fa73a90](https://github.com/bcgov/cas-cif/commit/fa73a90aabc4d5fa1cc420fd77e8707a522f27ba))
- add external user login button ([598e784](https://github.com/bcgov/cas-cif/commit/598e7846c8ddd1ca2451384709eebff297630d84))
- create external projects page ([529132a](https://github.com/bcgov/cas-cif/commit/529132a2ecabcd2d25e11a0f0d2c61a82bf3f565))
- external layout component ([e612f1c](https://github.com/bcgov/cas-cif/commit/e612f1cbcba461b003ddd36562c71db935802a36))

## [1.4.1](https://github.com/bcgov/cas-cif/compare/1.4.0...1.4.1) (2023-02-14)

### Bug Fixes

- correct the default parameter value for revision_type ([f326068](https://github.com/bcgov/cas-cif/commit/f3260682f56d0d3d25c43cb909b6cbae554844ec))

# [1.4.0](https://github.com/bcgov/cas-cif/compare/1.3.0...1.4.0) (2023-02-08)

### Bug Fixes

- added paymentPercentage to update mutation ([e43a494](https://github.com/bcgov/cas-cif/commit/e43a4943593b1ae9d519e13dcd149d776e52addf))
- adding 2 decimal places to provence share percerntage ([4670f07](https://github.com/bcgov/cas-cif/commit/4670f07f8b4b51fbe3dd201578f29c17591ff27e))
- show funding agreement in the summary page ([5e2b181](https://github.com/bcgov/cas-cif/commit/5e2b1817859b19ad9c2b979a468ef3af56742a5c))
- show yellow bg color when removing funding agreement ([a973a49](https://github.com/bcgov/cas-cif/commit/a973a49c97b9d9b3d4ab579c4e602d92346938ee))

### Features

- removed holdback and added payment percentage ([ee5e100](https://github.com/bcgov/cas-cif/commit/ee5e1009d704451ddc8febe2089211b1f34bedb8))

# [1.3.0](https://github.com/bcgov/cas-cif/compare/1.2.0...1.3.0) (2023-01-31)

### Bug Fixes

- add new calculation to forms ([e11a9d0](https://github.com/bcgov/cas-cif/commit/e11a9d0ebd17a74d3996a6969d005160663d72c7))
- add new calculation to forms ([c7ed018](https://github.com/bcgov/cas-cif/commit/c7ed01877d630bd62a2df9da2500f7af907f7c97))
- determing index from milestones ([2e88494](https://github.com/bcgov/cas-cif/commit/2e8849422661a451c037c00fdf2d60030751866a))
- milestone report due date updates according to milestones ([2964334](https://github.com/bcgov/cas-cif/commit/2964334688470f41ea98f6f8fc7e5c160902e0d3))

### Features

- add anticipated funding per fiscal year to funding form ([5eecb1f](https://github.com/bcgov/cas-cif/commit/5eecb1f4827441e2157058e10432a553864f3db1))
- new widget to display diffs on revision view page ([7c26235](https://github.com/bcgov/cas-cif/commit/7c262355c5f35e415e15416b84e9af1e97105c4a))
- project summary report form placeholder component ([026b738](https://github.com/bcgov/cas-cif/commit/026b738f068c13e748c4e9157255958b57f55622))
- render items in task list based on project funding stream ([95cff73](https://github.com/bcgov/cas-cif/commit/95cff73c640347ec5d11b1e8f8fef5472bd06741))

### Reverts

- Revert "chore: not showing content suffix when rendering diff on TEIMP form" ([b4cc3f1](https://github.com/bcgov/cas-cif/commit/b4cc3f19111cc0c139958f84209e5093ff2ec426))

# [1.2.0](https://github.com/bcgov/cas-cif/compare/1.1.4...1.2.0) (2023-01-23)

### Bug Fixes

- commit function should ignore form_data keys that are not columns ([caee07d](https://github.com/bcgov/cas-cif/commit/caee07d9e779623de6f7e525e84fb8336101284b))

### Features

- add calculated values to funding form ([1a8650d](https://github.com/bcgov/cas-cif/commit/1a8650d7b6482231abc188f764762503e91dcef2))
- adding calculated values for expenses and payments tracker ([89fd505](https://github.com/bcgov/cas-cif/commit/89fd5053ee110e1472210d2de48b6ca9750f2318))
- make funding stream read only on project form ([bf984a4](https://github.com/bcgov/cas-cif/commit/bf984a4fea6885bd35038f6c46050740c2c7c810))

## [1.1.4](https://github.com/bcgov/cas-cif/compare/1.1.3...1.1.4) (2023-01-18)

### Bug Fixes

- fix reversed calculated values and add to formContext ([372f3d0](https://github.com/bcgov/cas-cif/commit/372f3d0b0f883c70c275be681e33a87a3aff9f2c))

## [1.1.3](https://github.com/bcgov/cas-cif/compare/1.1.2...1.1.3) (2023-01-16)

### Bug Fixes

- update pgbackrest image to use artifactory ([d9a44c5](https://github.com/bcgov/cas-cif/commit/d9a44c505456b5c7b371176762c8080edf256467))

## [1.1.2](https://github.com/bcgov/cas-cif/compare/1.1.1...1.1.2) (2023-01-11)

## [1.1.1](https://github.com/bcgov/cas-cif/compare/1.0.1...1.1.1) (2023-01-11)

### Bug Fixes

- remove ; from heredoc delimiter ([8f6a84c](https://github.com/bcgov/cas-cif/commit/8f6a84c78125846b677ba18656978da453a05ffb))

# [1.1.0](https://github.com/bcgov/cas-cif/compare/1.0.1...1.1.0) (2023-01-10)

### Bug Fixes

- adding None as an option to Professional Designation ([f3b8918](https://github.com/bcgov/cas-cif/commit/f3b8918b3356208cc999a42ccd8f87ea551b4eb8))
- fix issue on showing caret with multiple child ([299e109](https://github.com/bcgov/cas-cif/commit/299e109ca03019170ceb284ef48a7e9a69c7277a))
- re-order sqitch plan ([8f3e30e](https://github.com/bcgov/cas-cif/commit/8f3e30e65c3a2b16f370b7f87f1ebe575c785ebd))
- set not null after updating column values ([8dc8627](https://github.com/bcgov/cas-cif/commit/8dc862702698c8a76daa093c6e8d44ddec3d3182))

### Features

- action amendment is waiting for ([742801f](https://github.com/bcgov/cas-cif/commit/742801fd1335388e75822b45d3f61060b2fc11d8))
- add a specific widget for handling amendment status update ([306cc1a](https://github.com/bcgov/cas-cif/commit/306cc1a50cfd5af9731d0f58bfbe6879102e51d5))
- add amedment status widget to revision schema and form ([11f6513](https://github.com/bcgov/cas-cif/commit/11f65139ca20cf1bd67970ab9c0f3fcf474b3468))
- add begins date option for datepicker, use for substantial completion date ([b493875](https://github.com/bcgov/cas-cif/commit/b4938756eefb96cd25b59b1785aa5c3fcf08809c))
- add email and phone regex with custom validation errors ([fd9e62e](https://github.com/bcgov/cas-cif/commit/fd9e62e3e988c515f2569b92480b085be2e3d863))
- add functinoality to tie report due date and substantial compl. date together ([fe86fe7](https://github.com/bcgov/cas-cif/commit/fe86fe732bafb5d1ca071d17d161e0c8ef4db556))
- add notification modal to view page ([989c3de](https://github.com/bcgov/cas-cif/commit/989c3de54d4679dd76f0d0e4b3ab8ceb3896c2f4))
- add total project value computed column ([eb427bb](https://github.com/bcgov/cas-cif/commit/eb427bb0e2fafeb10f690ab4178ed66c787dff4e))
- added dropdown with notify button widget ([7c331e3](https://github.com/bcgov/cas-cif/commit/7c331e3c3621951d7b8327c0fe2c1c351c56afbf))
- adding calculated values ([34069ec](https://github.com/bcgov/cas-cif/commit/34069eca6b2da99276585572535b7716c60515db))
- update funding agreement form and add total project value field ([5193bf6](https://github.com/bcgov/cas-cif/commit/5193bf687d6198b0ede53ff9222f0e8cf31d23a3))

## [1.0.2](https://github.com/bcgov/cas-cif/compare/1.0.1...1.0.2) (2023-01-05)

### Bug Fixes

- re-order sqitch plan ([8f3e30e](https://github.com/bcgov/cas-cif/commit/8f3e30e65c3a2b16f370b7f87f1ebe575c785ebd))
- set not null after updating column values ([8dc8627](https://github.com/bcgov/cas-cif/commit/8dc862702698c8a76daa093c6e8d44ddec3d3182))

### Features

- action amendment is waiting for ([742801f](https://github.com/bcgov/cas-cif/commit/742801fd1335388e75822b45d3f61060b2fc11d8))
- add begins date option for datepicker, use for substantial completion date ([b493875](https://github.com/bcgov/cas-cif/commit/b4938756eefb96cd25b59b1785aa5c3fcf08809c))
- add email and phone regex with custom validation errors ([fd9e62e](https://github.com/bcgov/cas-cif/commit/fd9e62e3e988c515f2569b92480b085be2e3d863))
- add functinoality to tie report due date and substantial compl. date together ([fe86fe7](https://github.com/bcgov/cas-cif/commit/fe86fe732bafb5d1ca071d17d161e0c8ef4db556))
- add notification modal to view page ([989c3de](https://github.com/bcgov/cas-cif/commit/989c3de54d4679dd76f0d0e4b3ab8ceb3896c2f4))
- add total project value computed column ([eb427bb](https://github.com/bcgov/cas-cif/commit/eb427bb0e2fafeb10f690ab4178ed66c787dff4e))
- added dropdown with notify button widget ([7c331e3](https://github.com/bcgov/cas-cif/commit/7c331e3c3621951d7b8327c0fe2c1c351c56afbf))
- adding calculated values ([34069ec](https://github.com/bcgov/cas-cif/commit/34069eca6b2da99276585572535b7716c60515db))
- update funding agreement form and add total project value field ([5193bf6](https://github.com/bcgov/cas-cif/commit/5193bf687d6198b0ede53ff9222f0e8cf31d23a3))

## [1.0.1](https://github.com/bcgov/cas-cif/compare/1.0.0...1.0.1) (2022-11-30)

### Bug Fixes

- all users should be able to execute update_or_create_user function ([8bff686](https://github.com/bcgov/cas-cif/commit/8bff68604c61887a41eb64d712c9dc1fb22c829c))

# [1.0.0](https://github.com/bcgov/cas-cif/compare/1.0.0-rc.5...1.0.0) (2022-11-29)

### Bug Fixes

- cast report auto-generator due date to timestamptz ([a052b42](https://github.com/bcgov/cas-cif/commit/a052b42b048d560e81dd35a3412ba7b5fd699113))
- fix project revision view page happo screenshot ([1f188f7](https://github.com/bcgov/cas-cif/commit/1f188f701a7365f992a3e36f79492b2e38bd1467))
- make projects filterable on primaryManagers ([6af1eab](https://github.com/bcgov/cas-cif/commit/6af1eab2d955332d892aac09fb0988a15148e9d1))
- omitting postgraphile delete mutation for project revision ([3a535c6](https://github.com/bcgov/cas-cif/commit/3a535c673cecf45baf8710c6e6fdce7a6cd44200))
- remove caret from project revision tasklist when has no child ([6415a16](https://github.com/bcgov/cas-cif/commit/6415a161a525339acda34f20cdba0282c859ca34))
- set time zone to vancouver time as a possible fix ([cabba41](https://github.com/bcgov/cas-cif/commit/cabba411283b099d0c663e0a71db100a2ccc08eb))
- typo and removing amendment type from general revision ([a3bbd3f](https://github.com/bcgov/cas-cif/commit/a3bbd3f4e1139fc0c14c2357ed84b735c76c0b05))

### Features

- add computed column to count revision type row number ([b36a497](https://github.com/bcgov/cas-cif/commit/b36a49784641e214cf81f4563442d21873566d91))
- add contract number to the ProjectForm ([6a23c8a](https://github.com/bcgov/cas-cif/commit/6a23c8a37d471a13f0395bd9fa62fdd97302b9da))
- add contract_number to project table ([c4d264f](https://github.com/bcgov/cas-cif/commit/c4d264f9395eda5700e476e42f98c2c4ac8ebf66))
- add project revision detail page ([4e40a08](https://github.com/bcgov/cas-cif/commit/4e40a08ac5dcee0d4389c38e9fdac61f596aaf23))
- added amendmenttype project revisions ([6313ef5](https://github.com/bcgov/cas-cif/commit/6313ef545a121c0819d767167e72cc19ff1113c5))
- flag on cif_user table to allow or disallow session_sub update ([d6c9e35](https://github.com/bcgov/cas-cif/commit/d6c9e3503b149544d4a2b0c203e99e15c5049d4f))
- hide amendments table and view page behind the flag ([66b26e5](https://github.com/bcgov/cas-cif/commit/66b26e5d4c2ea4bf81d82ad6215ba10eb4609ae0))
- hide new amendment page behind the flag ([b021465](https://github.com/bcgov/cas-cif/commit/b02146539f98ef0842b09283d063f929a3543c77))
- migration function to move the existing milestone form_changes to the new schema ([39a26df](https://github.com/bcgov/cas-cif/commit/39a26df8672d3f4156e28eded8536fe128c04455))
- reorder tasklist reports ([143be20](https://github.com/bcgov/cas-cif/commit/143be205197aff36f64896063c401de10af584e4))
- update computed columns to include contract number ([0ceefb1](https://github.com/bcgov/cas-cif/commit/0ceefb1c43742e3e04a8a55f5926fdbd87d0f2bb))
- user is updated or created upon connection, if allowed ([fdf9ab6](https://github.com/bcgov/cas-cif/commit/fdf9ab643973ece29752586d878f83c8ad5a3f6a))

### Reverts

- Revert "chore: bump minimatch package" ([90fd010](https://github.com/bcgov/cas-cif/commit/90fd010ba97be5dd279ac5774d05e9793c766e76))

# [1.0.0-rc.5](https://github.com/bcgov/cas-cif/compare/1.0.0-rc.4...1.0.0-rc.5) (2022-10-13)

### Bug Fixes

- amendment and revision task list highlight ([5b8b09c](https://github.com/bcgov/cas-cif/commit/5b8b09c7e5c3303c5a784333d16a78d2028ac5f9))
- correct budgets label ([a3416d9](https://github.com/bcgov/cas-cif/commit/a3416d9c034b7c326b039e4dd2e3d52cfa0b569b))
- remove pending revisions from dev data ([75c7463](https://github.com/bcgov/cas-cif/commit/75c7463af883741dd3c599fb5569b7fe50b905e8))
- replace undo change mutation with discard change mutation ([62dee15](https://github.com/bcgov/cas-cif/commit/62dee157949b0b863d3a3e8484ec5d50970ff292))
- separate quarterly and teimp report statuses ([e8aea09](https://github.com/bcgov/cas-cif/commit/e8aea09b258f334e9e8146547730d6f4d9b9a5e9))
- set project manager operation to update ([8352e1d](https://github.com/bcgov/cas-cif/commit/8352e1d35640a2f331cf778562e4cb693a503200))
- showing amendments task list only in view mode ([997b77f](https://github.com/bcgov/cas-cif/commit/997b77f2d9791b4a41c1c3e76a0c2f0cc51c5736))
- updated received date ([422c048](https://github.com/bcgov/cas-cif/commit/422c048e2db6901a4d8fa4d0531394038b138263))

### Features

- add additional dates to funding_parameter table ([c8afe28](https://github.com/bcgov/cas-cif/commit/c8afe285e9a9df07afdec2d1f7c11583e0b0d8fc))
- add additional funding source forms ([e869362](https://github.com/bcgov/cas-cif/commit/e8693623838d74680a853fdaff59cd958e9431e7))
- add additional funding source table ([0f89e8a](https://github.com/bcgov/cas-cif/commit/0f89e8a6fdc5cd94d0f7fa3b8c82622d7d301866))
- add amendments and other revisions section to the task list ([12a47ed](https://github.com/bcgov/cas-cif/commit/12a47ed6e14275cec1466a2a4a0c7c87c4fbedc4))
- add content suffix to date widget ([02c15bf](https://github.com/bcgov/cas-cif/commit/02c15bf668d8e7d081a518f4f786e18b8944e293))
- add content suffix to read only date widget ([75b41a3](https://github.com/bcgov/cas-cif/commit/75b41a3b5f6b3c243f69fce27704349390189328))
- add duration to measurement period end date ([931d67c](https://github.com/bcgov/cas-cif/commit/931d67ccc5cb27cced6975faf52ba03bc991c800))
- add emission intensity status badge ([92da42b](https://github.com/bcgov/cas-cif/commit/92da42b89c5c8ba840d0de728207fea6b81bb2fc))
- add generate reports mutation ([9b7456e](https://github.com/bcgov/cas-cif/commit/9b7456eaa238e98e3c18fe7f4af19c089a6d3c09))
- add project revision amendment type table ([201c9b8](https://github.com/bcgov/cas-cif/commit/201c9b877bf770cb9e3af0567e9237bc849d2b7b))
- add project_revision_effective_date computed column ([a1771c5](https://github.com/bcgov/cas-cif/commit/a1771c52064582a7cedfa9df85099fd62b66f582))
- add proponent cost field to budgets form ([15ad81e](https://github.com/bcgov/cas-cif/commit/15ad81e771d729ed317bd07bc21485a6c4b7b155))
- add rank to project form ([c17bf14](https://github.com/bcgov/cas-cif/commit/c17bf14147101e78fe0437e162f91a6e7973f64e))
- add report duration to teimp summary ([c371914](https://github.com/bcgov/cas-cif/commit/c371914b32689d333a8b4a04e54105cc53178b57))
- add report generator component ([57fcb24](https://github.com/bcgov/cas-cif/commit/57fcb24b8bfd9fe46ac5eff48001802876d63388))
- add report generator component to related components ([79ff35a](https://github.com/bcgov/cas-cif/commit/79ff35a16d9b9c4a0ed1a11e3c93ce5b27b99ec2))
- add score and project type fields to project overview form ([b4bf598](https://github.com/bcgov/cas-cif/commit/b4bf598816afe829088ce68c877ef04a1b553cd7))
- adding calculated holdback payment amount on TEIMP form ([40c68a2](https://github.com/bcgov/cas-cif/commit/40c68a2b4546f1c7750d641c89ecf0802236c20d))
- adding column to hold an adjusted value on teimp payment amount ([3cbead7](https://github.com/bcgov/cas-cif/commit/3cbead74185bbae474719621f5aa13d81040fdb3))
- adding computed column to query ([60c58fb](https://github.com/bcgov/cas-cif/commit/60c58fba06a5999788a8e328105ec39f54595f1d))
- computed column to return the teimp payment percentage ([3f45d5e](https://github.com/bcgov/cas-cif/commit/3f45d5e2f882a1fb45eda89658be3e74dba3da1d))
- computed columns to total gross and net payment amounts ([6834a41](https://github.com/bcgov/cas-cif/commit/6834a41dd3445ae51b0cab728ca8cc98a4a4e7cd))
- create rank widget and add to project form ([e4f4369](https://github.com/bcgov/cas-cif/commit/e4f4369e64fa1912b544f10b5b15fc565ac2699d))
- custom update_form_change mutation ([cc967a8](https://github.com/bcgov/cas-cif/commit/cc967a8d10856864a18f36a2e45fb08ac00f3986))
- date sent to csnr field for teimp form ([9b3b228](https://github.com/bcgov/cas-cif/commit/9b3b228d69eab96a34b1f21be4cdda10fa6c383e))
- dynamic generation of tasklist items ([3905e04](https://github.com/bcgov/cas-cif/commit/3905e041d6948418899a63c355791701246462e6))
- make contact phone number optional ([53d444b](https://github.com/bcgov/cas-cif/commit/53d444bd5143b5ff00523a12a07ff05d65bc606b))
- replace commit_form_change trigger by a mutation ([f0052af](https://github.com/bcgov/cas-cif/commit/f0052af2f7995621c906ffaffcd02ed4065f270b))
- replace commit_project_revision trigger by a mutation ([d95b4a8](https://github.com/bcgov/cas-cif/commit/d95b4a817c5b42cbf0f6ee78d448c95dcda34b9b))
- stage form change custom mutation ([739b6cd](https://github.com/bcgov/cas-cif/commit/739b6cdb466f7338640456bc540da97b9751bd54))
- teimp payment amount computed column ([ab17340](https://github.com/bcgov/cas-cif/commit/ab17340e3ae7d54c90c94cd00bd3bbaabf6335f2))

# [1.0.0-rc.4](https://github.com/bcgov/cas-cif/compare/1.0.0-rc.3...1.0.0-rc.4) (2022-08-15)

### Bug Fixes

- adding project contacts to dev data ([e05bd68](https://github.com/bcgov/cas-cif/commit/e05bd6817cca21a4fa9919ff9e8a02817b441278))
- remove conditionalAmountWidget ([ce7a75b](https://github.com/bcgov/cas-cif/commit/ce7a75b8d4e3ab5c5366e384649957cee4829117))

### Features

- adding percentage widget ([427ab75](https://github.com/bcgov/cas-cif/commit/427ab75901b4e37e2f562e6f05ce1d6c9d681cd7))
- adding yes no options to funding report ([cc41b2f](https://github.com/bcgov/cas-cif/commit/cc41b2f94cb94d7c419ac9b3fc73975a8a04c230))
- enhancing budget form flows ([940e050](https://github.com/bcgov/cas-cif/commit/940e0505766a999ce05101f564df71cca07a2979))

# [1.0.0-rc.3](https://github.com/bcgov/cas-cif/compare/1.0.0-rc.2...1.0.0-rc.3) (2022-08-08)

### Bug Fixes

- add missing emission intensity report sql union ([163e5d4](https://github.com/bcgov/cas-cif/commit/163e5d48e78a375fb9d4889fa910f85305b0e00c))
- change login page link based on environment ([918034a](https://github.com/bcgov/cas-cif/commit/918034a398ae72df51b12952f1bc3bd18083b023))
- fix milestone status and due date badge after being removed ([d40cfdb](https://github.com/bcgov/cas-cif/commit/d40cfdbb87d487614ffbcaae9ba1b3080fdc026c))
- fix page content bouncing ([b011052](https://github.com/bcgov/cas-cif/commit/b01105264fb59f04d43454256a007e38a33cf729))
- fix reporting tasklist statuses ([b96ea25](https://github.com/bcgov/cas-cif/commit/b96ea25445a721eba9fab64bc52e61ba878847b0))
- fix undoing primary contact the first time ([989612a](https://github.com/bcgov/cas-cif/commit/989612a0761e25d5bddb7f012206ef25e44feeff))
- fix wrong annual report information on summary form ([160b6e7](https://github.com/bcgov/cas-cif/commit/160b6e752319a3815fa4a5a1c5c9f47fdc4e9bb3))
- fixing date discrepancy between indicator and form field ([fb21d36](https://github.com/bcgov/cas-cif/commit/fb21d366d6ca249dca5c4fddb86a4561ca8bc643))
- move default values to mutation to cover issues ([e6408f7](https://github.com/bcgov/cas-cif/commit/e6408f7e2fc9f5939a1c1e32820e1bc2df324b66))
- possible fix to pass e2e test on CI ([3d86d26](https://github.com/bcgov/cas-cif/commit/3d86d26a0a00646159f120b8f11c03daa8cca818))
- show $ prefix for milestone budget data ([368cad0](https://github.com/bcgov/cas-cif/commit/368cad08403d60ab822623015055658418a9198f))
- temporary fix for footer height on mobile view ([015ebc3](https://github.com/bcgov/cas-cif/commit/015ebc3cb66df3a71d300352ac04b8b1a93b95cd))
- uiSchema was not properly applied to Funding Agreement summary ([99bb337](https://github.com/bcgov/cas-cif/commit/99bb3376a3811470b9eaeb87f70f994a67235234))
- use mocked time to solve happo diffs ([d17e1f4](https://github.com/bcgov/cas-cif/commit/d17e1f43a90a31795f221378effc59172a0182fe))

### Features

- add calculated performance field to TEIMP form ([821ccbd](https://github.com/bcgov/cas-cif/commit/821ccbd76db59a84abddd868a2527142f880535a))
- adding discard mutation that removes emission_intensity report ([50c3705](https://github.com/bcgov/cas-cif/commit/50c37052c0aa22aa154169159ce32823c4172f51))
- adding emission intensity report mutation and reworking report type to include teimp ([d841d4e](https://github.com/bcgov/cas-cif/commit/d841d4ec9e1a7393ba6380df5122597a0c3991cf))
- handle multiple forms on the teimp page ([7515ca0](https://github.com/bcgov/cas-cif/commit/7515ca01f4566c0186aa4b734bd2c8eb35a9ad85))

# [1.0.0-rc.2](https://github.com/bcgov/cas-cif/compare/1.0.0-rc.1...1.0.0-rc.2) (2022-07-14)

### Bug Fixes

- pre-release check was missing path to schema ([416a37b](https://github.com/bcgov/cas-cif/commit/416a37ba71fa174a491b776aa10806baa9cc26c0))

# 1.0.0-rc.1 (2022-07-14)

### Bug Fixes

- .secrets.baseline ([09b39a9](https://github.com/bcgov/cas-cif/commit/09b39a9f4f6ff2fc877cf5e5c13211b21bcc8035))
- add aria-label to PhoneNumberWidget ([c1b7501](https://github.com/bcgov/cas-cif/commit/c1b75018562af992efa2ac6dcd269172322e44b4))
- add ErrorComponent relay option ([89b777e](https://github.com/bcgov/cas-cif/commit/89b777ea74cbbf78aa469529fe9668b9414eef62))
- add ErrorComponent relay option ([8905b42](https://github.com/bcgov/cas-cif/commit/8905b42c3271afed4b2404cce38fc449cd9f5d50))
- add mockAuthCookie to config instead of constant ([cc1ffd7](https://github.com/bcgov/cas-cif/commit/cc1ffd73c699e8b432e9330b557384e306a9a2f0))
- add semicolon to fix test.yaml bash command ([23bd4bc](https://github.com/bcgov/cas-cif/commit/23bd4bccdced813dbee2670dc84164f16b54898a))
- added connection key ([d456c15](https://github.com/bcgov/cas-cif/commit/d456c1504f405a196040665ba70bec1d8b6f9f6b))
- adding a drop db command on the db init container ([7224dff](https://github.com/bcgov/cas-cif/commit/7224dffed74cbb3f8c3592761352847e5728ab1b))
- adding sentry env var to next runtime config ([997c29b](https://github.com/bcgov/cas-cif/commit/997c29bd86e8a47103cd9a9e111f78753382b8ae))
- always render a Suspense on the client ([5d49688](https://github.com/bcgov/cas-cif/commit/5d496889871c3a9289068004110baf1404f9ac4e))
- always show Custom500 page ([59b1b7d](https://github.com/bcgov/cas-cif/commit/59b1b7d4ab459512e2e6098acc00bfa10f3826b9))
- banner image should not use a `Link` to `/` ([7e8706d](https://github.com/bcgov/cas-cif/commit/7e8706db8fff879069d38fce88e234ef44e42bad))
- blue highlight in the autocomplete suggestions ([36b3f2f](https://github.com/bcgov/cas-cif/commit/36b3f2fbcb3cf3f5655c7b64cdf37b9d84f2e547))
- bug in dev data that prevented adding additional reports ([5511a2e](https://github.com/bcgov/cas-cif/commit/5511a2eebfadfd13151fd898f6fba6fcba3001bc))
- bumping react-sso & adding extended session events ([abf579e](https://github.com/bcgov/cas-cif/commit/abf579e0bc3b924b1f31d0c216012fae4088b664))
- case in test and import function ([4b51aa0](https://github.com/bcgov/cas-cif/commit/4b51aa0b9909f8a58193917f889ffde35f251706))
- cast funding to number in dev data ([b5a5ffd](https://github.com/bcgov/cas-cif/commit/b5a5ffd049f936dc73aba08ed0ab9192ed133407))
- check certificate instead of route in chart condition ([ea5dfae](https://github.com/bcgov/cas-cif/commit/ea5dfae0504acfb8946a43e21b65de01638e601f))
- cleanup edits ([77110d6](https://github.com/bcgov/cas-cif/commit/77110d66d5f1635d84c290e27abd550da7e64d30))
- clear button refreshes page data ([14dc6ee](https://github.com/bcgov/cas-cif/commit/14dc6ee4b1b798236f53274edaf5f3b54e71bf1c))
- code cleanup ([22fc45c](https://github.com/bcgov/cas-cif/commit/22fc45cf8e8bb968e878c40fe968e68c8cb00fd9))
- comma ([4b4ac92](https://github.com/bcgov/cas-cif/commit/4b4ac92eb14aed647cb948c61cd7b0fb1ee73a1f))
- comment on funding_stream ([e8c3126](https://github.com/bcgov/cas-cif/commit/e8c3126d8ca7fbc1f24a8d179e29ce0d60e0e669))
- committed_changes_are_immutable does not always prevent delete ([0a541e5](https://github.com/bcgov/cas-cif/commit/0a541e520473def992cf967cadbc5bdc46fd99ef))
- config changes ([b4ef8ae](https://github.com/bcgov/cas-cif/commit/b4ef8ae1debe9fe3c82344c962d267a4e25c7782))
- contact "Resume editing" button should not create a new form ([12148c0](https://github.com/bcgov/cas-cif/commit/12148c0a3dfdf35b6a385b6d2d435ebead69e35d))
- contact form handle submit should have different debounce key ([a8cc300](https://github.com/bcgov/cas-cif/commit/a8cc300545f0a21bf544c3f5052763baef2e9e33))
- correct numbering in tasklist ([14ffd4f](https://github.com/bcgov/cas-cif/commit/14ffd4fe80e3604811612eeed80fca5515fdfda6))
- correct reportDueDate name ([f197a8b](https://github.com/bcgov/cas-cif/commit/f197a8b8b9079a271c17bd6bbc75a2606cf2888e))
- correctly name form ([fee4968](https://github.com/bcgov/cas-cif/commit/fee496838fb38713048900121cf2d1ab2653f5e6))
- correctly name ProjectQuarterlyReportForm ([316f59f](https://github.com/bcgov/cas-cif/commit/316f59fe3c71b27c8f95e0077a1db11fad173767))
- create app role in a sqitch change ([c23b02d](https://github.com/bcgov/cas-cif/commit/c23b02dbb9046c5f3172a1f5950f6bd13a86be38))
- css issues, padding on text area and summary ([0e5d0fc](https://github.com/bcgov/cas-cif/commit/0e5d0fc105450bab5e0fffa4672370830bc76c4f))
- cypress test and cleanup ([bd07c71](https://github.com/bcgov/cas-cif/commit/bd07c71a37b5da39ffca67b1eb94aacec586366b))
- debug e2e tests ([69ee044](https://github.com/bcgov/cas-cif/commit/69ee044477e7a5c0c0739f7c50e93f82107e699f))
- dependancies ([6b4483b](https://github.com/bcgov/cas-cif/commit/6b4483b9d1b9c93b6c2c8c7d91619857e87d9f2b))
- display project manager names in desired order ([3c919df](https://github.com/bcgov/cas-cif/commit/3c919df4b55dedda0d8c638c9be676ecc63534c7))
- don't crash if req.cookies is undefined ([e72aaf2](https://github.com/bcgov/cas-cif/commit/e72aaf2123b490f23fe447efb4e037bccae2ce3d))
- don't fail silently when deploying dev data ([ca87191](https://github.com/bcgov/cas-cif/commit/ca871914494f8155c5cc069f3ad1d0f3b409b493))
- don't override operator id when inserting dev data ([7a110d8](https://github.com/bcgov/cas-cif/commit/7a110d8f93972c618d3d2f1236d04bb212e151f5))
- don't trigger mutation with an empty project overview ([0e44e78](https://github.com/bcgov/cas-cif/commit/0e44e783a15c3ee8c0cd70ea5c4b5691a588d7ba))
- drop schema syntax issue ([980ca34](https://github.com/bcgov/cas-cif/commit/980ca34b3b4c05123ed36d61c77050ddb06c0da5))
- e2e test and fixes for contact form ([9eedbd9](https://github.com/bcgov/cas-cif/commit/9eedbd93593b985e1b226f08be6ac636b9265db0))
- event handler fix for errors, on forms ([d7e6796](https://github.com/bcgov/cas-cif/commit/d7e6796a33cd7ae54312399d4ee6bf3380a0663f))
- fix cif.reporting_requirement_status comments ([c253195](https://github.com/bcgov/cas-cif/commit/c2531955a6c0dee6f7fa65d22e52ea41fa6d9478))
- fix command to test.yaml to bypass pre-commit error ([eea7dac](https://github.com/bcgov/cas-cif/commit/eea7dac636a813de1920414af0e4a295084716bb))
- fix import in quarterly-reports ([436a12e](https://github.com/bcgov/cas-cif/commit/436a12e24feaf267d771ca45af793bed32fd76f6))
- fix off-by-one report dates bug ([ef29461](https://github.com/bcgov/cas-cif/commit/ef294611bf38fdc459cc8266e202484039b20477))
- fix project contacts not undoing properly ([235d1a1](https://github.com/bcgov/cas-cif/commit/235d1a1d5c659f339cfff9dfd36226bb076fa616))
- fix report type test ([6163f09](https://github.com/bcgov/cas-cif/commit/6163f095874898b33b90c8fd07fca6936a3d7419))
- fix reporting requirement upsert_timestamp_columns argument wording ([d935df9](https://github.com/bcgov/cas-cif/commit/d935df9d88e19be4ba2269ceb3bc362697fb1cde))
- fix styled-jsx boolean property issue ([f88c1de](https://github.com/bcgov/cas-cif/commit/f88c1de5fd35cb03974a8c16327de903690be53e))
- fix TS error in GlobalAlert ([7573497](https://github.com/bcgov/cas-cif/commit/757349774d855dcc0dbb19b205ac0f2132e4f0c0))
- fix typo in pre-upgrade command and stop silent failure ([d64da42](https://github.com/bcgov/cas-cif/commit/d64da42c8305f4b70a4260bd4e04b860f5f40bca))
- fix validation errors for primary contact ([7e7b7b7](https://github.com/bcgov/cas-cif/commit/7e7b7b7b701e6a472371fc9124f14a755471e422))
- fixing the issue ([5173c38](https://github.com/bcgov/cas-cif/commit/5173c384f7736291422623009126e6438393187c))
- fixing the luxon date diff method ([80c47f4](https://github.com/bcgov/cas-cif/commit/80c47f44318588830825719d2b264127aefdc69f))
- form errors don't show if the error array is set but empty ([83c1f49](https://github.com/bcgov/cas-cif/commit/83c1f4967dfc39df325a8d6f2aa9baf512c7cda7))
- handle empty new_form_data json ([d942429](https://github.com/bcgov/cas-cif/commit/d9424297acd27e670c47355977f4c05ad4cd5c23))
- insert for happos fixed, projectTableRow status value added ([be608d5](https://github.com/bcgov/cas-cif/commit/be608d56ca085118cd6cdbe66fdb962184957e2d))
- jest skip ignores ([7a1622f](https://github.com/bcgov/cas-cif/commit/7a1622fc7e2c29b4d87b94886e3c25e1ba0325f7))
- lint ([aa9e080](https://github.com/bcgov/cas-cif/commit/aa9e08017db16c41cb263a0d08f89d10ad0670e6))
- linting ([6bc6423](https://github.com/bcgov/cas-cif/commit/6bc64232cf70c7d0bd28ebba7b0a32d2e76107ac))
- linting ([583dd6c](https://github.com/bcgov/cas-cif/commit/583dd6cdbe1c6253a3aa272816305661e59bf75d))
- logout button is displayed for unauthorized users ([d7dc1a6](https://github.com/bcgov/cas-cif/commit/d7dc1a6d6c05e9f3bb6c6d9575eecc157f1be15c))
- make date inputs work ([31a27b9](https://github.com/bcgov/cas-cif/commit/31a27b90b997bfc44a3aaa2514150968a002fa2c))
- make MoneyWidget clear properly ([b86a6c4](https://github.com/bcgov/cas-cif/commit/b86a6c43a0b4ae07db4b3eb9de7e3b38305f5690))
- make SelectParentWidget clear properly ([32180f8](https://github.com/bcgov/cas-cif/commit/32180f8d869041b256297d68b9c313e92be316db))
- manager and contact form_change records not staged when archived ([450316e](https://github.com/bcgov/cas-cif/commit/450316eac6ca34231e74807841c9c1cf2b681500))
- mark the relay store as stale when committing a form_change ([02ba1a6](https://github.com/bcgov/cas-cif/commit/02ba1a6ae06a77474dd33dd7a58b65aca7ce543b))
- moneyWidget doesn't generate NaNs ([ea2601e](https://github.com/bcgov/cas-cif/commit/ea2601ee08932e6ca2b94aedf4e11f6a8990d826))
- move BCTypography component in app_js ([96a9f00](https://github.com/bcgov/cas-cif/commit/96a9f00041e5140135411e117ada3440e7fa1a85))
- option type added ([234451e](https://github.com/bcgov/cas-cif/commit/234451ef634f7a3275dd6731aae15e27ea6e77a9))
- persist funding stream value, useMemo added for selected values ([0d0ef97](https://github.com/bcgov/cas-cif/commit/0d0ef97876163c177f5c275512fbeb8ba9609f88))
- pgpassword in config ([545bfb0](https://github.com/bcgov/cas-cif/commit/545bfb0a312ce3978fd47ece94ca9aa13872e62d))
- postgres incremental backups should not run at 8am ([32d6974](https://github.com/bcgov/cas-cif/commit/32d6974481e9664653f945116c61252a9549365c))
- pre-commit ([7d5cdac](https://github.com/bcgov/cas-cif/commit/7d5cdac5f12a1326ee0e202888023815e300f732))
- pre-upgrade script doesn't need to terminate connections ([f51ec73](https://github.com/bcgov/cas-cif/commit/f51ec73ca7a7c9299757effd8038906513864697))
- prevent uncaught exception when submitting empty overview form ([36305b9](https://github.com/bcgov/cas-cif/commit/36305b9f935381647e368843fa570198dfd03afd))
- project revision test fix ([e1e98b3](https://github.com/bcgov/cas-cif/commit/e1e98b34720bf66d7ad7abc2b44ae15f83687c15))
- rebase fixes ([060b1cd](https://github.com/bcgov/cas-cif/commit/060b1cd132df629ba0f52c374eaae576c859b396))
- redirect URI passed to keycloak ([7029d8e](https://github.com/bcgov/cas-cif/commit/7029d8e9013c4fff709322a3abd5b60ccff0adec))
- refactored tests ([7a6418a](https://github.com/bcgov/cas-cif/commit/7a6418aba16e6ce55765027a4b9a5463dc4aa833))
- relay network batchMiddleware should not allow batching mutations ([523ccca](https://github.com/bcgov/cas-cif/commit/523cccab2c7c1479d30ffb26b82504847968299f))
- relay server query uses PORT env variable ([7b0a175](https://github.com/bcgov/cas-cif/commit/7b0a175a5c0cd3b5f52c41aadd8311bc79ea84e4))
- reload on mutation complete ([9324c18](https://github.com/bcgov/cas-cif/commit/9324c183f11fc54fa774f57e752011a8b0225d78))
- remove DISPLAY ERROR text ([3c9de16](https://github.com/bcgov/cas-cif/commit/3c9de1698e7b05afb0473f6f9140773366e746fb))
- remove null contactId ([6257728](https://github.com/bcgov/cas-cif/commit/6257728aa5e47a60a4cdc8e38af8c979699ec701))
- remove sorting for project managers from project list ([7fd0228](https://github.com/bcgov/cas-cif/commit/7fd0228696c5e218b4129eee5de2c233f17766e7))
- remove wait in cy test ([d13c8ea](https://github.com/bcgov/cas-cif/commit/d13c8ea398937205bafe177b686dc4a0d462b67c))
- removed obsolete funding stream form ([e8feb49](https://github.com/bcgov/cas-cif/commit/e8feb496f3e9f51e6482273b30c33eba459c9bb4))
- resolve conflicts ([ee286bf](https://github.com/bcgov/cas-cif/commit/ee286bf06d3e8446c9e1c81ea558c8e6157bd352))
- resolve module not found error ([ffe019b](https://github.com/bcgov/cas-cif/commit/ffe019ba1150c958412e0e1c61f4e3ba0b3e1868))
- resolve unit testing issues ([00314ba](https://github.com/bcgov/cas-cif/commit/00314ba5a80babf22ec5465ccf6afb8b51bb59ad))
- returning tasklist in mutation for auto update in task list ([c5d423d](https://github.com/bcgov/cas-cif/commit/c5d423d83e63d95442e6813f298f3c08e222fadf))
- rowId updated ([c97a68c](https://github.com/bcgov/cas-cif/commit/c97a68cb21580ac4edc8c13495e098cb3f4059a3))
- schema and lint ([199ac6f](https://github.com/bcgov/cas-cif/commit/199ac6f3e9ca922a6dd80e1af0b673886571adf9))
- schema image should be build with root dir as the context ([2b9cfac](https://github.com/bcgov/cas-cif/commit/2b9cfac7a496b6e983aa7346e72408a90386c703))
- search dropdown widget allows resetting to a no data selected state ([36b2357](https://github.com/bcgov/cas-cif/commit/36b2357f1ee7230d6e111cb61196ea86db861280))
- session expiry modal should be displayed 2min before logout ([5900336](https://github.com/bcgov/cas-cif/commit/59003366ff6b6eb2811409ace65b9377af816967))
- setup fontawesome CSS following the docs ([0d24b32](https://github.com/bcgov/cas-cif/commit/0d24b329cbd073a6e567482a51adc72bfa45d427))
- show only milestone statuses in project table ([08c0a13](https://github.com/bcgov/cas-cif/commit/08c0a13350e31ff86b1087e400aee0e2d4923dd2))
- snapshots ([1d2800a](https://github.com/bcgov/cas-cif/commit/1d2800a2ae1f1208eb09f0b372bc9c51a0c948e0))
- styling issue on half screen ([206f29c](https://github.com/bcgov/cas-cif/commit/206f29c45dc35764abe59a73bccc9531db4cbe1a))
- syntax error in makefile and add IMAGE_TAG param ([ec3eb1c](https://github.com/bcgov/cas-cif/commit/ec3eb1c1e367ef31de9fc425bc8c8d721c184a21))
- tasklist highlighting on milestone & annual reports ([3d935ed](https://github.com/bcgov/cas-cif/commit/3d935ed2ea8deb08f49d8be99079dd29cab1e915))
- test value fix ([7faf090](https://github.com/bcgov/cas-cif/commit/7faf09036b79246c973e830dd8c01e5b6e990fa7))
- updated mutation to refresh list when complete ([6856a62](https://github.com/bcgov/cas-cif/commit/6856a6268d88664c9e1133024817364d818cab7f))
- updated name references ([82d181d](https://github.com/bcgov/cas-cif/commit/82d181dabe2da69006c979dbaeff45b0c7a8b1a4))
- use computed status columns in TaskList ([5123249](https://github.com/bcgov/cas-cif/commit/51232495aa8197bd7b94a091c47e4cdfa845ce9c))
- use optional chaining when looking at change status ([41d8a6b](https://github.com/bcgov/cas-cif/commit/41d8a6b34b1dffc4688ad32b375ed6690ff30e3a))
- use pending project revision ([e833d80](https://github.com/bcgov/cas-cif/commit/e833d80a72b1178205ab31fb9651afeaa09c714a))
- use postgraphile's schema-only usage to create user ([f100f57](https://github.com/bcgov/cas-cif/commit/f100f575812149ea3e21f5d275493e284814b142))
- use proper orderBy prefix for statuses ([4e64d61](https://github.com/bcgov/cas-cif/commit/4e64d61ad35492bfe6af48ec917f65a163a91c20))
- using memo, and adding sqitch verify & deploy scripts ([e6ddfd6](https://github.com/bcgov/cas-cif/commit/e6ddfd6a84868d9fe2cb91656a2d5907754930f6))
- when adding a project_contact, it should have validation errors ([7820406](https://github.com/bcgov/cas-cif/commit/7820406e16dae50a6092314ee07a588dfd7c7422))

### Features

- `commit_form_change` can generate `form_data_record_id` ([c145380](https://github.com/bcgov/cas-cif/commit/c1453809c35f9f78e4f3623c9c8fc2bab8282701))
- a component to hold contact forms and add as needed ([aec2dac](https://github.com/bcgov/cas-cif/commit/aec2dacc19841c8cbf89e0dbe83ed119c55bd16e))
- a trigger that prevends modification of a deleted record ([60f3489](https://github.com/bcgov/cas-cif/commit/60f34893fe0e8c54f0ffc19889256f5a06fcf98d))
- add `project.pendingProjectRevision` ([a97c008](https://github.com/bcgov/cas-cif/commit/a97c008a57b5790cec118b4645257df3614d96a4))
- add `staged` status in `change_status` ([735f8b7](https://github.com/bcgov/cas-cif/commit/735f8b77854ff6a477e9900a56da29e22a12dd8f))
- add `validateOnMount` to `FormBase` ([6235eaa](https://github.com/bcgov/cas-cif/commit/6235eaa3ac45a0cc9b0df0b176c0fc87991b3dd2))
- add AdjustableCalculatedValueWidget ([843afc8](https://github.com/bcgov/cas-cif/commit/843afc8ed90e050799d21e85172fe55d3379e20d))
- add bucket provisioner job ([00cd2c8](https://github.com/bcgov/cas-cif/commit/00cd2c8100c5d00bcb3159344a5e707a2435685b))
- add budegt item category as enum type ([62cf328](https://github.com/bcgov/cas-cif/commit/62cf328a4fe3532e85a082f90696c975e907fce0))
- add budget item table ([d91437f](https://github.com/bcgov/cas-cif/commit/d91437f1d956c82b86e007522fcca78fb08521db))
- add certbot chart dependency ([c6c5073](https://github.com/bcgov/cas-cif/commit/c6c5073c5fb79cee94fa64dcdf2f4432add169ba))
- add change_reason column to project_revision ([4baf641](https://github.com/bcgov/cas-cif/commit/4baf641fc015ae63719b8c4be387ef5b393a1e37))
- add chronological ordering function as comments (TBC) ([57d4bdb](https://github.com/bcgov/cas-cif/commit/57d4bdb0c298f4e410ea7b114bc2ef143fb5a992))
- add cif.contact table ([6700340](https://github.com/bcgov/cas-cif/commit/6700340acb733092d8bbc4e5ca3b386924552231))
- add column sorting ([5c42eaa](https://github.com/bcgov/cas-cif/commit/5c42eaabece5ba9bf84b8be4e4d4369dcf36380d))
- add comment field to project table ([401aceb](https://github.com/bcgov/cas-cif/commit/401aceba139caa2121af7b7ba2b0f11f481cb088))
- add company name to contact form ([2e112aa](https://github.com/bcgov/cas-cif/commit/2e112aa5f93f11c1827db2e1c7324a3ac90b27d6))
- add confirmation before discarding project revision ([2b8dcb0](https://github.com/bcgov/cas-cif/commit/2b8dcb09da6493152c309cf6f65f096423062933))
- add contact form ([aadbcec](https://github.com/bcgov/cas-cif/commit/aadbcec70750814d45cd17fd4b7e825674652d5a))
- add contact view page ([3d18eea](https://github.com/bcgov/cas-cif/commit/3d18eea9ec5b9063fab54b8deeb26967fc4ea3ce))
- add contacts and operators stub page ([df62c92](https://github.com/bcgov/cas-cif/commit/df62c92c2b11b0b4c636dc649504b0d95913d417))
- add contacts table ([a144618](https://github.com/bcgov/cas-cif/commit/a1446185c2ae4755766f2faa048e5ef9d74a1174))
- add custom createProjectRevision mutation ([8c1ce8f](https://github.com/bcgov/cas-cif/commit/8c1ce8f478a9a579ffed4468e128ab81b9917029))
- add debounceMutationMiddleware ([cbd9c7b](https://github.com/bcgov/cas-cif/commit/cbd9c7b9e4325e2226fe751c36854e3ea99859c3))
- add delete button ([962eafe](https://github.com/bcgov/cas-cif/commit/962eafe5b64c57ad771999ec1f83b3d73ed5d159))
- add edit button to project page ([0a2508a](https://github.com/bcgov/cas-cif/commit/0a2508abc48925538dd30baf01f449d6ff467ad2))
- add empty state to table ([5bf2869](https://github.com/bcgov/cas-cif/commit/5bf28697ff9d015d853d3034be28af62db6c5ff1))
- add error messages to new mutations ([916260b](https://github.com/bcgov/cas-cif/commit/916260bd913ed9e816a063565f52a897f0d9f7de))
- add filtering and pagination display to projects table ([7b43f11](https://github.com/bcgov/cas-cif/commit/7b43f1187363f13dc2837982e264e671831f644e))
- add filtering of related columns ([40e5132](https://github.com/bcgov/cas-cif/commit/40e5132f46e565f0265b8543b542a2a9fe735463))
- add foreign data wrapper to retrieve swrs operator data ([5c98913](https://github.com/bcgov/cas-cif/commit/5c98913b4b4b01092ad5ed1353cd90181e86bee3))
- add funding agreement form ([eddaf5a](https://github.com/bcgov/cas-cif/commit/eddaf5a94c6f432d1432bcb4fb2444a168c9a469))
- add GlobalAlert to DefaultLayout ([982b1af](https://github.com/bcgov/cas-cif/commit/982b1af6b4c1e1decfa4c90853332d30b6914ccf))
- add kc hint to auth url params ([9cb198d](https://github.com/bcgov/cas-cif/commit/9cb198db034b083d1d19a18257e0cff25493bddb))
- add kc login to chart ([fc7dae3](https://github.com/bcgov/cas-cif/commit/fc7dae3a6f97a0c9cf99ac3c52720156db4bfc92))
- add LoadingFallback component ([34cdc20](https://github.com/bcgov/cas-cif/commit/34cdc20f21e0c5b6926319e7362dfb95fc7c8dce))
- add milestone-reports page ([9889df1](https://github.com/bcgov/cas-cif/commit/9889df11478307942d9859b84931b0185ee0eaae))
- add mutation to stage all form changes that are not pristine ([0d5a515](https://github.com/bcgov/cas-cif/commit/0d5a515fd748f6a56750067a864670fd5ba17abb))
- add payment table ([95f7eb2](https://github.com/bcgov/cas-cif/commit/95f7eb249e6d256a72d6293bd8bcf714fc104460))
- add pending_new_contact_form_change function ([59feefb](https://github.com/bcgov/cas-cif/commit/59feefb9209a0f6341b00135f31422d5184459a2))
- add pendingNewProjectRevision query ([5549b5e](https://github.com/bcgov/cas-cif/commit/5549b5ed5a5e9200457812a0e819e3146adb42a9))
- add PhoneNumber widget ([68d74fb](https://github.com/bcgov/cas-cif/commit/68d74fb789334cb6876b77af8c8e95b91f365352))
- add project funding agreement form summary ([30a6bc3](https://github.com/bcgov/cas-cif/commit/30a6bc3ad773f79e26d03db1e4f764aca1f67f61))
- add Project Name to project form ([b8b624c](https://github.com/bcgov/cas-cif/commit/b8b624cf84c87d4eef89d956d8902551932ff00b))
- add project_contact table ([22401a7](https://github.com/bcgov/cas-cif/commit/22401a7f15c3ad1ad2e246c65ced787376533e49))
- add projects table ([41646e8](https://github.com/bcgov/cas-cif/commit/41646e850e8f1db1c1daab797199c57e44eb825d))
- add quarterly reports to tasklist ([ba7fc97](https://github.com/bcgov/cas-cif/commit/ba7fc974ce6073970e101fb770db4bc56584341a))
- add quarterly_report migration ([71a09cb](https://github.com/bcgov/cas-cif/commit/71a09cb5fbf5b065c9bef05acf714c3fa327a1be))
- add quarterly_report migration ([905e161](https://github.com/bcgov/cas-cif/commit/905e1612c6286fafd04bb9f8f4b9c26807efe19f))
- add report type db table ([a902d51](https://github.com/bcgov/cas-cif/commit/a902d51a05549a78293568937ea25bc63b9386f3))
- add reporting requirement status enum type ([118be20](https://github.com/bcgov/cas-cif/commit/118be20681d10eef7486eb64371427940febef2f))
- add reporting requirement table ([635088b](https://github.com/bcgov/cas-cif/commit/635088b63d5536cce14678a7ca4e2d71b3515b93))
- add scripts to ensure sqitch changes are immutable ([79fde22](https://github.com/bcgov/cas-cif/commit/79fde2236baa6c93b981bde80e25ef0b2fc589c1))
- add sector information to project ([ab2a3fe](https://github.com/bcgov/cas-cif/commit/ab2a3fe73b238e29554b30f8c084852463f4e22b))
- add Select Operator component ([1034d71](https://github.com/bcgov/cas-cif/commit/1034d7191c5fd5349043268e39d225b6b342cb52))
- add status badge to annual report form ([388caff](https://github.com/bcgov/cas-cif/commit/388caff7fc0841ce8054598e103c23f4687e8724))
- add status badge to quarterly report form ([73e119e](https://github.com/bcgov/cas-cif/commit/73e119e419af06d511610078f40b1c9f0d12e7b8))
- add Status component to report forms ([6c49b5a](https://github.com/bcgov/cas-cif/commit/6c49b5a87cc0548f6270625ccc5b57297c237371))
- add SubHeader component ([84dd977](https://github.com/bcgov/cas-cif/commit/84dd97722f5a2fd45676d9d70665a7207da98760))
- add SUPPORT_EMAIL to next config ([b539355](https://github.com/bcgov/cas-cif/commit/b539355fa645acf752004cd3fe93d55519b7fdbd))
- add task list component ([14a5310](https://github.com/bcgov/cas-cif/commit/14a531033bd81caf634f60e9e3ca3d3dd2c31346))
- add text to tell user if no change made ([642cf7b](https://github.com/bcgov/cas-cif/commit/642cf7b147a39e70a979deb03687e82fb4168c60))
- add timestamp columns to `form_change` ([2875a6d](https://github.com/bcgov/cas-cif/commit/2875a6d9a9d54529588810e90bf5bbfe3a3357b9))
- add totalFundingRequest to project form ([8444cec](https://github.com/bcgov/cas-cif/commit/8444cec98472692b5ea1f028519423845c88c3b8))
- add undo button to annual report form ([648e12d](https://github.com/bcgov/cas-cif/commit/648e12dd57ef6160fabc45bda9a946109892d885))
- add undo button to milestone report form ([9216367](https://github.com/bcgov/cas-cif/commit/92163674f97e5f24642369b6f72f17db9909c5a3))
- add undo button to project contacts form ([5420793](https://github.com/bcgov/cas-cif/commit/542079367c5e4b1235d3806f428ac462052f3749))
- add undo button to project managers form ([bd49797](https://github.com/bcgov/cas-cif/commit/bd4979754d44a7a37f66aa32f823efb1b2b28c69))
- add undo button to project overview form ([55a1754](https://github.com/bcgov/cas-cif/commit/55a1754f2aab5b256837c7f26ed03708308fb28b))
- add undo changes button to quarterly report form ([40939e4](https://github.com/bcgov/cas-cif/commit/40939e41663caa32cd7065ffbad049ebdae2a6f7))
- add unique contraint on contact emails ([d95c597](https://github.com/bcgov/cas-cif/commit/d95c59746f4c0c5f5aaa94d7b9fed8cb12d74d72))
- add unique index for pending project revisions ([0f3516e](https://github.com/bcgov/cas-cif/commit/0f3516e9e84692dfb12c77fb4b9007af76ce0694))
- add useDebouncedMutation hook ([701117f](https://github.com/bcgov/cas-cif/commit/701117f9b2dc24bb9ec870a252ae1e5698c147ec))
- add useEffect to \_app.tsx to clear error whenever Component changes ([32f6968](https://github.com/bcgov/cas-cif/commit/32f6968c4f12308a3533d560940a964e15ee45a8))
- add useMutationWithErrorMessage to attachment mutations ([7e3b055](https://github.com/bcgov/cas-cif/commit/7e3b055f18542859491051ee6d6b830c5e6b1ef9))
- add useMutationWithErrorMessage to contact page mutations and test ([9af2d22](https://github.com/bcgov/cas-cif/commit/9af2d22cc8af8048fad0ff48c27b735039fd1fa4))
- add useMutationWithErrorMessage to Dashboard component and test ([5b00351](https://github.com/bcgov/cas-cif/commit/5b003518fd5200c562d5aa74818634d185e3fab4))
- add useMutationWithErrorMessage to deleteFormChange mutation ([c57d11b](https://github.com/bcgov/cas-cif/commit/c57d11b51e60eb3406a3ed6ac38d5c3a48967e8e))
- add useMutationWithErrorMessage to operator mutations and test ([6cd8718](https://github.com/bcgov/cas-cif/commit/6cd871800710416b86b86ae2b08b43554e9eaa10))
- add useMutationWithErrorMessage to project mutations and test ([3dce7a5](https://github.com/bcgov/cas-cif/commit/3dce7a52ab227db36ce318abc6df009874b3f228))
- add useMutationWithErrorMessage to project page mutations and test ([deef406](https://github.com/bcgov/cas-cif/commit/deef4068e4adef5df5556f355fd8772f4a16092d))
- add useMutationWithErrorMessage to project revision mutations and test ([9fb8bf6](https://github.com/bcgov/cas-cif/commit/9fb8bf6bafb69d327b217b82fdd1e8be4920e798))
- add useMutationWithErrorMessage to ProjectContactForm component and test ([4d0c296](https://github.com/bcgov/cas-cif/commit/4d0c29671a379a744905b7ade7aee94f0bbd1d64))
- add useMutationWithErrorMessage to useArchiveMutation and test ([6762a71](https://github.com/bcgov/cas-cif/commit/6762a71b233184a7eb303463c80eb55c08cbf659))
- add validateOnMount prop everywhere ([ef4a741](https://github.com/bcgov/cas-cif/commit/ef4a7411acce37b1c85fbfeaa51b9f22af0bf64e))
- added funding_stream table ([57e811c](https://github.com/bcgov/cas-cif/commit/57e811ce133e4b744dc7a45502649b644240046c))
- added searchable statusus ([b01d730](https://github.com/bcgov/cas-cif/commit/b01d73068bb7a5d2ce04680a88cfc47875500dce))
- added select widget template for funding stream dropdown ([1ac0589](https://github.com/bcgov/cas-cif/commit/1ac0589d945f36dcd5680b58811349dba3014952))
- adding a foreign key to project_revision on form_change ([a1397a8](https://github.com/bcgov/cas-cif/commit/a1397a8d6933c45f81287530013db6572ccf5a7d))
- adding a project table ([e4be32d](https://github.com/bcgov/cas-cif/commit/e4be32d4822cf69042eb6d0c1477485e25c8c970))
- adding attachments link to the tasklist ([c3bdf8d](https://github.com/bcgov/cas-cif/commit/c3bdf8da7cfa858c2b8212e3b15419ea51740dc7))
- adding clear to date pickers ([953e34a](https://github.com/bcgov/cas-cif/commit/953e34afa7864a7f1fa03f1234254dbe0fdd52a7))
- adding custom columns for project and pm forms ([c97c7b8](https://github.com/bcgov/cas-cif/commit/c97c7b8bb278916d59ce77d18ebc3086571f6b07))
- adding full name functions for cif_user and contact ([8121161](https://github.com/bcgov/cas-cif/commit/812116199231acde29c0a5f9fec1a19573d0f947))
- adding funding_parameters table ([ba5f47c](https://github.com/bcgov/cas-cif/commit/ba5f47c2d9f4278287917c6ee9897687a8c8e621))
- adding json schema for operator form ([cf08b65](https://github.com/bcgov/cas-cif/commit/cf08b65dfb51c39160cd06254984ee348b2efe8e))
- adding project background form ([32d7bbe](https://github.com/bcgov/cas-cif/commit/32d7bbea3446190eb2a213e756cd2e336cd5112c))
- adding project revision table and trigger function ([2190e13](https://github.com/bcgov/cas-cif/commit/2190e1310bd680c2ccb868aa8f49d43fc8938672))
- adding status badge for milestone due ([74785cf](https://github.com/bcgov/cas-cif/commit/74785cf8521d77dd3b401e0fd6b940d60fbbcd00))
- adding status to tasklist, for projects ([21454a4](https://github.com/bcgov/cas-cif/commit/21454a4aae43e7f5aceed88f1d543a249ddb67a7))
- adding unique project id to the project table ([b09fbd9](https://github.com/bcgov/cas-cif/commit/b09fbd995aae906e01cff1df013ff089f42ec211))
- adding validation_errors column to form_change table ([7192f6d](https://github.com/bcgov/cas-cif/commit/7192f6d498b962c726b0f0118a074410d35db0e4))
- align fieldset and saving indicator border color ([f40dcc8](https://github.com/bcgov/cas-cif/commit/f40dcc8f4b26b37c431ea9895dac9707128b7f76))
- all form mutations should fetch the TaskList fragment ([6b3a7de](https://github.com/bcgov/cas-cif/commit/6b3a7de2c9a57eebacf40f9ea8c3a6c65897d011))
- allow concurrent editing of contact ([39f90ca](https://github.com/bcgov/cas-cif/commit/39f90cabab6751c2c6c2d94556789a82a2cb6327))
- allow diffing with CUSTOM_DIFF_FIELDS component ([2cee117](https://github.com/bcgov/cas-cif/commit/2cee11776d480e39b5a699e0585dd4ee87b4163c))
- allowing user to set the id on the form ([ff666c3](https://github.com/bcgov/cas-cif/commit/ff666c3d66eca781613219e9bd17e4c415f9879d))
- annual reports ([bd54417](https://github.com/bcgov/cas-cif/commit/bd544177dc9ea80c40556857e5df63d352fbe29d))
- archive form_changes should not be pristine ([3abe619](https://github.com/bcgov/cas-cif/commit/3abe619564a70f9f91eaea803c4cca8a87f16bb4))
- basic theme with rjsf ([952fb76](https://github.com/bcgov/cas-cif/commit/952fb7647afc4fe80c68319207c7fe6935e70dc6))
- calling appropriate mutation on auth callback ([19dd04e](https://github.com/bcgov/cas-cif/commit/19dd04e10900d15027cbc3bf22a1a47ff1dc2166))
- clear primary contact ([da3a2fa](https://github.com/bcgov/cas-cif/commit/da3a2fac37447d15fe49ca2ca38ed61ef3192c6d))
- client side validation ([63696f2](https://github.com/bcgov/cas-cif/commit/63696f2ac2f4a3690690ad6fbc73863c32fc10e0))
- collapsible report ([ca4a205](https://github.com/bcgov/cas-cif/commit/ca4a205d968f364cadedca9d7cf60d598ea64223))
- commit \_form_change trigger converts keys from camelCase ([ba17857](https://github.com/bcgov/cas-cif/commit/ba178579922a11905993b0d5e890fef21ae9efe5))
- computed column for the upcoming requirement form change ([88d61a9](https://github.com/bcgov/cas-cif/commit/88d61a9e55a9795cb5adabd4c814ef5b7e85ad4c))
- computed column to retrive an operator's pending form change ([ceb9b1d](https://github.com/bcgov/cas-cif/commit/ceb9b1da4967c5fba8ed1ed6d6aebe42c9065528))
- computed column to verify unique value in form change ([a5e77ab](https://github.com/bcgov/cas-cif/commit/a5e77abcc69b8010aff49beb53ab8fe5c46a8a36))
- conditionally add payments form to milestones ([2c22f53](https://github.com/bcgov/cas-cif/commit/2c22f5332bb4836f1db6b088589fbd965689f3a3))
- config with node convict ([369ce1b](https://github.com/bcgov/cas-cif/commit/369ce1b9e6a306854c51042a3fc21194299f89f9))
- contact details component ([85df151](https://github.com/bcgov/cas-cif/commit/85df1519ebc20af5ca2a7e5344ab9f3eab462b98))
- contact details in contact form summary ([2e6502c](https://github.com/bcgov/cas-cif/commit/2e6502c6ef84c0f180feed1404b9abfbb5210029))
- contact form self-validates everything ([5d87555](https://github.com/bcgov/cas-cif/commit/5d87555dae745ab2e1a6a4342abe87aa39bdfe4a))
- contact view page shows contact comments ([da62608](https://github.com/bcgov/cas-cif/commit/da62608a25392eebad9c4be7a3525c0c8b56b431))
- create 404 page ([337c465](https://github.com/bcgov/cas-cif/commit/337c465123ffe3ce7cd2bbe8ee48f924875cc12e))
- create 500 page ([a5a323e](https://github.com/bcgov/cas-cif/commit/a5a323e5c4df98d4b6733487957b0cde32cd011a))
- create GlobalAlert component ([3e01ffd](https://github.com/bcgov/cas-cif/commit/3e01ffdd3b5c233fe1edc0518a9326419ca7bb87))
- create LoadingSpinner component ([9234c65](https://github.com/bcgov/cas-cif/commit/9234c65fb34c879c81837ba257ac8a307d6ffd87))
- create ProjectAnnualReportFormSummary component ([3df72bb](https://github.com/bcgov/cas-cif/commit/3df72bb22dfd28f5654349ca6a65f95462027a4d))
- create ProjectAnnualReportFormSummary component ([b0ec0ea](https://github.com/bcgov/cas-cif/commit/b0ec0ea8a9318ec54a13fe8401de06b096c8be30))
- create quarterly report schema (spec work) ([9201014](https://github.com/bcgov/cas-cif/commit/92010141582e136a6fea88f7f7e7cf19ac2cd5d3))
- create readonly widgets and theme ([961ccc5](https://github.com/bcgov/cas-cif/commit/961ccc55e5bfc20da379aa26bdbe9be73879924f))
- create ReceivedDateWidget ([dde6a0a](https://github.com/bcgov/cas-cif/commit/dde6a0ae3eaaec43474dbed49f8fb24ee492cbec))
- create reporting requirement schema ([158a0fe](https://github.com/bcgov/cas-cif/commit/158a0fea81daf8e8ea628e10d29986a90eb13da6))
- create StaticLayout component ([9e72b0c](https://github.com/bcgov/cas-cif/commit/9e72b0c2fdfb6068bfad40cf9a7aff9609853f8f))
- create update mutation for reporting requirements ([f17f7d5](https://github.com/bcgov/cas-cif/commit/f17f7d5f5ea52dc8dded1e3f9aa09d5bd165762d))
- db-init only grants extension usage, pre-upgrade deletes schemas ([d3ff2c4](https://github.com/bcgov/cas-cif/commit/d3ff2c4ffaf61e930019c86c4ac0e1b335a438a9))
- debounced mutation for change reason ([1dcbe62](https://github.com/bcgov/cas-cif/commit/1dcbe62836216d041fb127840cca20ef0459df73))
- DefaultLayout passes `isAdmin` to Navigation ([ef80c8d](https://github.com/bcgov/cas-cif/commit/ef80c8def0de5b8abea91c64a71a7b459aa04596))
- deleting contact entries with relay updater ([9ca8bf5](https://github.com/bcgov/cas-cif/commit/9ca8bf552bfa4fbeab4fe191b13a167ce362ba53))
- display forms in read only when in view mode ([255067e](https://github.com/bcgov/cas-cif/commit/255067e5ca5b0691e53a36dec09e78142b60133c))
- display names, using format last, first. ([71077e4](https://github.com/bcgov/cas-cif/commit/71077e406c2b807916eb379b9c1ce8a20701af0a))
- display project details ([577f4bb](https://github.com/bcgov/cas-cif/commit/577f4bbd677edd184126d74337e704f0a4e48223))
- display rjsf errors in a consistent, styled way ([1d727db](https://github.com/bcgov/cas-cif/commit/1d727db3e76bb70152bc5bbf1037f9a38ea8b244))
- display summary fields or not added message ([0eadfc7](https://github.com/bcgov/cas-cif/commit/0eadfc7189ca37b6a84b75cfa020616e95501bb3))
- dockerfile installs pip requirements before copying python files ([916dee4](https://github.com/bcgov/cas-cif/commit/916dee4f18ce59be5c715a8b331840ffdf6d846d))
- document upload relay config and round trip ([ae91567](https://github.com/bcgov/cas-cif/commit/ae91567d43f0bc5d07a5df198e61cb595587cfe9))
- don't create primary contact on project creation ([3668d20](https://github.com/bcgov/cas-cif/commit/3668d20e488c3e962b15458efaa95e88fbbc7287))
- download button is functional ([1a348ec](https://github.com/bcgov/cas-cif/commit/1a348ece90739e99204fad9d556f332137ce7357))
- edit contact form ([2594ab7](https://github.com/bcgov/cas-cif/commit/2594ab741b84059ec85ecef444b6357d3d297820))
- edit page for the operator ([214cca6](https://github.com/bcgov/cas-cif/commit/214cca63fcaca1969e4483167fb6b2f2691a2655))
- editing a project manager form sets it to pending ([a52c3c7](https://github.com/bcgov/cas-cif/commit/a52c3c71e73a6f6805dc365c837f1b48f9e858c6))
- filter project table ([3465f4b](https://github.com/bcgov/cas-cif/commit/3465f4baddedd24dd52393b5251e6fcfe24de709))
- fix dev data, use forms to populate ([8ab1316](https://github.com/bcgov/cas-cif/commit/8ab1316648c690403184cd1d6c64a02eaa5af5f8))
- fix optimistic response and add rowId (spec work) ([49d6ede](https://github.com/bcgov/cas-cif/commit/49d6edecf58ddd5d2f3495ffaa00c7b378da7e35))
- form_change and project_revision can be deleted ([62a3534](https://github.com/bcgov/cas-cif/commit/62a3534fa5b7ae5a0040a62f232aed8cd42ef297))
- form_change operation is an enum ([7db024d](https://github.com/bcgov/cas-cif/commit/7db024d86dffde8072560821fb770ee61d66a34b))
- FormBase clears the extraErrors on submit ([5ace198](https://github.com/bcgov/cas-cif/commit/5ace198c8c60cc35373986991e75054315a4e46a))
- generate the project long id ([31445e9](https://github.com/bcgov/cas-cif/commit/31445e97abf2da74ba06a67e0a81664efae2997d))
- generic discard mutation ([895b043](https://github.com/bcgov/cas-cif/commit/895b043fc06dadf005d35357582578dfd3af9f37))
- generic function to retrieve a pending form change for a user ([91bacac](https://github.com/bcgov/cas-cif/commit/91bacac7ad5438e820354ef5c73b49caf64c1f9e))
- handle change reason input ([3164f48](https://github.com/bcgov/cas-cif/commit/3164f4810f17d6b0ed50b4ae95aabe44889cc8ed))
- handle revision in progress logic ([1c311e3](https://github.com/bcgov/cas-cif/commit/1c311e3e822ab926737f37dbcef3c3c7045b3838))
- handle view mode in contacts and mangers ([dc9fa69](https://github.com/bcgov/cas-cif/commit/dc9fa69f544a1a700b173752c9fd14f8e9433b83))
- handle view mode in taskList ([35dabaa](https://github.com/bcgov/cas-cif/commit/35dabaa0f1d4985c04d1ffca61707cc6be90c7dd))
- helper for component testing ([1b4c9ab](https://github.com/bcgov/cas-cif/commit/1b4c9abbee5e88f36b37bd2290b4f1f3f3750f78))
- helper to create a mocked router ([9fde80c](https://github.com/bcgov/cas-cif/commit/9fde80ca80aa0db71051aed42d1d1740bf712c61))
- hide login button in StaticLayout component ([4941580](https://github.com/bcgov/cas-cif/commit/49415808de1631fed048947e12af16c6fa381a91))
- highlight currently opened task ([efb8927](https://github.com/bcgov/cas-cif/commit/efb89270ce32ddde97276069158a7d253ab12d4f))
- history gets recorded for projects ([9cfddd6](https://github.com/bcgov/cas-cif/commit/9cfddd6f316ec5fce9dd01dafd242e2c8347fdd7))
- index and login-redirect pages follow redirection rules ([02496e5](https://github.com/bcgov/cas-cif/commit/02496e5befe59cba1ad710c56b9d23519993cc53))
- individual milestones show up in TaskList ([61add6d](https://github.com/bcgov/cas-cif/commit/61add6d84ddbd19fe71c5ee290df9e0d781757b7))
- initial code for document storage ([eac8c0e](https://github.com/bcgov/cas-cif/commit/eac8c0e374c6e046c36a7a0fb677cb191122932c))
- landing page ([4a0a8d1](https://github.com/bcgov/cas-cif/commit/4a0a8d15e17e107ff32f97576949b3360ea9048c))
- logically order project form fields ([793724e](https://github.com/bcgov/cas-cif/commit/793724e603232de61faa9330f57a6ab6f5cca355))
- make addReportingRequirementToRevision mutation ([27e08df](https://github.com/bcgov/cas-cif/commit/27e08df2e83073a4c2adcf4598a224aeb775734e))
- make form update ([e451571](https://github.com/bcgov/cas-cif/commit/e451571dc6e34874b5bcd2fe3e03e5d08f10e264))
- make primary contact optional ([4980a60](https://github.com/bcgov/cas-cif/commit/4980a608247b5e81d4033e3a1119007bc12edbfb))
- make report form and add button ([7d19e81](https://github.com/bcgov/cas-cif/commit/7d19e8153f53a5f597041309081ab8b4c5266425))
- make submit button take users to next page when creating projects ([31769cd](https://github.com/bcgov/cas-cif/commit/31769cdfc7d5208d8e3a10fefa56203a0f9e1142))
- make submit button work ([f39e4b4](https://github.com/bcgov/cas-cif/commit/f39e4b4b0db99a22546c0e06e1560f6c3e99af5a))
- make useDebouncedMutation use useMutationWithErrorMessage ([ae79c4f](https://github.com/bcgov/cas-cif/commit/ae79c4f62fdeb0c8325cc2e5dfffd4d168a00cde))
- move create project page and add stub pages for project ([1af71f6](https://github.com/bcgov/cas-cif/commit/1af71f6999a4770c9504728ed167004dbc0d1d55))
- multiple project managers can be added to a revision ([1a4318a](https://github.com/bcgov/cas-cif/commit/1a4318a01064566efa10525e0a34bb27f60d01b7))
- mutation to discard a revision in a hook form ([90ab8ca](https://github.com/bcgov/cas-cif/commit/90ab8ca729fb0db1b059f6819f4d5dafa6dee66d))
- new mutation to add a secondary contact form_change to a revision ([b16549a](https://github.com/bcgov/cas-cif/commit/b16549ac3147003350c87494c28a477cc89c30de))
- new operator function ([72fbc82](https://github.com/bcgov/cas-cif/commit/72fbc82622583c6c20e06593095adb170f95b5cb))
- operators list view with filtering ([cdcbe2a](https://github.com/bcgov/cas-cif/commit/cdcbe2a67e07e1b5c693d4e226ad3c5fa18ba637))
- pagination styles ([db7a73b](https://github.com/bcgov/cas-cif/commit/db7a73bb40c5b6b5a1b32da0b17aad43d68ddf59))
- PGPASSWORD should be url encoded ([4e0cc9d](https://github.com/bcgov/cas-cif/commit/4e0cc9d8dc8feb6049628e37ff310ef89a0a29dc))
- phone number must be in E.164 format ([7e3ea46](https://github.com/bcgov/cas-cif/commit/7e3ea46ec2f696f53899192e542682d390833ca9))
- preload CleanBC logo ([fa29790](https://github.com/bcgov/cas-cif/commit/fa29790bb76033c49b7e622d72bfbf7fe7371cc0))
- project funding stream dropdown ([aaac8fd](https://github.com/bcgov/cas-cif/commit/aaac8fdc9aab095936fa649f5b02d990d472a2d2))
- project manager table migration ([52639d9](https://github.com/bcgov/cas-cif/commit/52639d9752b9a8ef2fd309055d8ee0f95a59f85b))
- project summary page, showing validation errors ([a2fa346](https://github.com/bcgov/cas-cif/commit/a2fa34646005f600646051c8da56e1b1006e1ded))
- project_status table and related components ([3a7794f](https://github.com/bcgov/cas-cif/commit/3a7794f71dd93092b50d098ed1a2d8708ebbb373))
- project-documents ([9cce7bc](https://github.com/bcgov/cas-cif/commit/9cce7bc5f173affca575cdd8f76a9e2c4b940394))
- ProjectContactForm stages forms ([4a0f9df](https://github.com/bcgov/cas-cif/commit/4a0f9dfd0206f08dba5dc68f2660a2dec4a001a8))
- ProjectContactForm supports archiving existing records ([e366470](https://github.com/bcgov/cas-cif/commit/e366470a9354ede92bc6db44bad81cea3d1a2d1e))
- ProjectManagerFormGroup stages form changes ([df0746c](https://github.com/bcgov/cas-cif/commit/df0746c90a9809bc3d5ec23eda10bfa58c42fa04))
- projects can be filtered by status ([adafc9a](https://github.com/bcgov/cas-cif/commit/adafc9a572ee6b377430b16298c3f08b6606476d))
- provisioning a gcp bucket for documents with terraform ([25badfb](https://github.com/bcgov/cas-cif/commit/25badfbe1ebd21db9698bc3ef1a42f5c42794cb3))
- quarterly reports (spec work) ([f037db1](https://github.com/bcgov/cas-cif/commit/f037db187bad9479e21db0b6384bbdd785a6b35e))
- quarterly reports spec work ([adfd5a9](https://github.com/bcgov/cas-cif/commit/adfd5a94610df1e2462f486225406abc92e84e80))
- redirect all pages with url parameter to 404 ([ca6f825](https://github.com/bcgov/cas-cif/commit/ca6f82582c03733152d839b3b2ac39ad168bb72f))
- refactor contact form to handle unique email ([8a7d7a8](https://github.com/bcgov/cas-cif/commit/8a7d7a8b4a6b27d87f1d0bae3be6b3d03ebb5379))
- reject promise on error when staging project contact forms ([d5569b4](https://github.com/bcgov/cas-cif/commit/d5569b4109a3a45998ef3ab90e646c16b3718a10))
- removed cifuser for createdBy on attachment ([35e975f](https://github.com/bcgov/cas-cif/commit/35e975f6871235a3061ec695a390dfd04ec5b6f4))
- rename project `description` to `summary` and render with textarea ([f911321](https://github.com/bcgov/cas-cif/commit/f9113213c28d6229a00d977648eb7bbeba18d69e))
- renamed first_name, last_name to given_name, family_name ([b292601](https://github.com/bcgov/cas-cif/commit/b292601c7d132e565546373e874230dff234b88d))
- render styles on the server side ([cfb955b](https://github.com/bcgov/cas-cif/commit/cfb955bb0f7c3d89ffacc3415d99aff6f8a68a73))
- report due indicator on the quarterly reports form ([206868a](https://github.com/bcgov/cas-cif/commit/206868a4f332c6b00f58008e9fae360b9b2a8e66))
- resume creation and edition of contacts ([81121f0](https://github.com/bcgov/cas-cif/commit/81121f037607359a8e01a504a7d5df4336965ea0))
- right alignment of buttons ([6629c06](https://github.com/bcgov/cas-cif/commit/6629c06bf3740076814eadb0bb5ceeb68f2b71c8))
- saving contact form information ([0610f7e](https://github.com/bcgov/cas-cif/commit/0610f7e30507c9346f09c753282c6dbf0d8c8eb9))
- scripts to configure the keycloak realm ([4b4d4e8](https://github.com/bcgov/cas-cif/commit/4b4d4e8a97c4598153481f58a57d0c8c976c333a))
- searchable dropdown filter with custom css ([b24bcb4](https://github.com/bcgov/cas-cif/commit/b24bcb49d56772b1fb19019afcc9099ec9efd9b7))
- send error to Sentry if the table refetch errors ([8ba0ddb](https://github.com/bcgov/cas-cif/commit/8ba0ddbed913fdc81b2364313955b292bb0153fd))
- send Sentry relay error instead of user-friendly error ([b19056a](https://github.com/bcgov/cas-cif/commit/b19056a10a59f701e4a80a36a9da59ea458e1cbf))
- server download helpers from previous work ([b6f0cd1](https://github.com/bcgov/cas-cif/commit/b6f0cd1e079b6b06625f7a2298ccf9ab8cc4af0c))
- server router for downloading files ([fbc46d6](https://github.com/bcgov/cas-cif/commit/fbc46d60ae6234f0016e95187b6f832c3c421382))
- server side validation ([27a95de](https://github.com/bcgov/cas-cif/commit/27a95de6cd2177037c4b025a26af53b3a9ed83d8))
- set up ErrorContext ([5329a35](https://github.com/bcgov/cas-cif/commit/5329a35fa7d2ce0867f3612dabd56c12fcc342a6))
- set up useMutationWithErrorMessage ([c1a1680](https://github.com/bcgov/cas-cif/commit/c1a1680d8ec534f3d2b86e97b621f6236b0dafc4))
- show "Resume Draft Project" button when a draft exists ([6647af6](https://github.com/bcgov/cas-cif/commit/6647af64076e1261848cf5e312a9f2546814de90))
- show project managers on project page ([91fb629](https://github.com/bcgov/cas-cif/commit/91fb629214c5ae37de128d5acd0f0f67c2bfa40e))
- showing edit project state in task list ([b007915](https://github.com/bcgov/cas-cif/commit/b0079158628d2789e600c56e8d84192321224cc6))
- spec work on displaying summary ([7ff8e85](https://github.com/bcgov/cas-cif/commit/7ff8e85dd3009681cd1c2b6288a6bdf5181f8bc5))
- spec work on updating form ([0e4ba31](https://github.com/bcgov/cas-cif/commit/0e4ba3147426123282838cfa756bed8dbb78ecfd))
- split project creation page ([ccd503f](https://github.com/bcgov/cas-cif/commit/ccd503fbf3db609a488cae5f068fe4115f841900))
- stage contacts and managers when they have validation errors ([d1de607](https://github.com/bcgov/cas-cif/commit/d1de607514e1e1f712ae14331e42d240de6dc27d))
- status badge for individual reports ([4bd1094](https://github.com/bcgov/cas-cif/commit/4bd10940b44f99962236224dad83ad1a02132845))
- storage api sets a header to pass content length ([d013e55](https://github.com/bcgov/cas-cif/commit/d013e55e51570beb2b718cbb788edccc7185ebda))
- swrs organisation id is immutable ([c8ec33a](https://github.com/bcgov/cas-cif/commit/c8ec33abcebc963b30c731dadbbcc685275d9d39))
- Table component prefetches the query before updating the router ([96a2875](https://github.com/bcgov/cas-cif/commit/96a2875957f5220fc89e5f7bab86afbd4a81d0d0))
- task list sections are expanded if their status is attention req ([8e2bbfb](https://github.com/bcgov/cas-cif/commit/8e2bbfb02f13d9e64adafb421675c2c34f33769c))
- trigger function making sure the committed changes are immutable ([162f3f8](https://github.com/bcgov/cas-cif/commit/162f3f80a790af7662a6e8f29fc9f04b7b5e7dc7))
- trigger to propagate project_revision deletion to the form_change records ([0a42457](https://github.com/bcgov/cas-cif/commit/0a424572c0d066421a18ce067058d9f2d0462a6b))
- trust the first proxy, regardless of its ip ([122ddb6](https://github.com/bcgov/cas-cif/commit/122ddb646ba6d7a828838caa851cc9773336e73f))
- undo_form_changes resets project form change to null ([1549e60](https://github.com/bcgov/cas-cif/commit/1549e607d3b5bbed878a1e54f9a1a08f419e8e29))
- update form styles ([a5d930c](https://github.com/bcgov/cas-cif/commit/a5d930c5ba21013b762a30484b541d69a14f7906))
- update trigger to prevent reasonless revisions ([6cf7dfa](https://github.com/bcgov/cas-cif/commit/6cf7dfaea0a3a14c4b790df7db24bb18ae7e0cc0))
- upsert_timestamp_columns also adds the immutable deleted trigger ([d1c38ac](https://github.com/bcgov/cas-cif/commit/d1c38ac74ead24b99791004931ad37f1ec780007))
- use certbot instead of acme.sh for SSL cert issue ([02ec888](https://github.com/bcgov/cas-cif/commit/02ec88834630c25d64ee70c705df46b71d1a6f52))
- use debounced mutation in create-project and add saving indicator ([7ee171e](https://github.com/bcgov/cas-cif/commit/7ee171e7d68ba05dafd71c95292c51df07994333))
- use default page size in withRelayOptions ([a973e29](https://github.com/bcgov/cas-cif/commit/a973e29fcae38d9645376181e762665e473bc334))
- use sso-express onAuthCallback to create user ([3df9924](https://github.com/bcgov/cas-cif/commit/3df9924eb8f65370fc1f70bf4aaec4204fb39684))
- use updated sso-express package to redirect on login ([8c7350f](https://github.com/bcgov/cas-cif/commit/8c7350f958e35de5cb1a2e4a2c316b0d7fe47d31))
- use vanity urls for the app routes ([29ba62d](https://github.com/bcgov/cas-cif/commit/29ba62ded14b68d41b3990b4ec34af0b06e625ba))
- validation plugin retrieves the ids of the changes to validate ([e76da6f](https://github.com/bcgov/cas-cif/commit/e76da6fc10e64a2bb5f4212a20a70748ba1ca951))
- View button in project table redirects to project ([e85044b](https://github.com/bcgov/cas-cif/commit/e85044be4cf3433af74487888e460b42811fecd3))
- widget for due dates ([1d54300](https://github.com/bcgov/cas-cif/commit/1d543001fe73e3c7beb69e3f04cdc3a589521ce2))
- wiring the project page filtering ([52419d0](https://github.com/bcgov/cas-cif/commit/52419d03f81b8005447e6a585f40365f2cb51248))

### Reverts

- Revert "chore: spec work on computed column" ([d60e983](https://github.com/bcgov/cas-cif/commit/d60e9833a3b1213e3d2d0713852cbbf7c3cf827d))
- Revert "chore: replacing dd with divs for accessibility" ([41c209a](https://github.com/bcgov/cas-cif/commit/41c209aeba4c799be111b01f297d07aac8764452))
- Revert "chore: pratice button" ([6a8f92e](https://github.com/bcgov/cas-cif/commit/6a8f92eae844052dd86c7296f077ec9e94965c72))
- Revert "test: failing schema.json" ([e9c23d4](https://github.com/bcgov/cas-cif/commit/e9c23d4216ae223dfc77a4b166ee023c4685adeb))
