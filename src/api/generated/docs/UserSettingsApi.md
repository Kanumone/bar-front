# UserSettingsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**userSettingsControllerGet**](#usersettingscontrollerget) | **GET** /api/user-settings | Получить настройки пользователя|
|[**userSettingsControllerUpdate**](#usersettingscontrollerupdate) | **PUT** /api/user-settings | Обновить настройки пользователя|

# **userSettingsControllerGet**
> UserSettingsResponseDto userSettingsControllerGet()


### Example

```typescript
import {
    UserSettingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserSettingsApi(configuration);

const { status, data } = await apiInstance.userSettingsControllerGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**UserSettingsResponseDto**

### Authorization

[session](../README.md#session)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userSettingsControllerUpdate**
> UserSettingsResponseDto userSettingsControllerUpdate(updateUserSettingsDto)


### Example

```typescript
import {
    UserSettingsApi,
    Configuration,
    UpdateUserSettingsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UserSettingsApi(configuration);

let updateUserSettingsDto: UpdateUserSettingsDto; //

const { status, data } = await apiInstance.userSettingsControllerUpdate(
    updateUserSettingsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateUserSettingsDto** | **UpdateUserSettingsDto**|  | |


### Return type

**UserSettingsResponseDto**

### Authorization

[session](../README.md#session)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

