# QuizAnswersApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**quizAnswerControllerCreate**](#quizanswercontrollercreate) | **POST** /api/quiz/answers | Отправить ответ на вопрос викторины|
|[**quizAnswerControllerFindAll**](#quizanswercontrollerfindall) | **GET** /api/quiz/answers | Получить все ответы игроков|
|[**quizAnswerControllerFindMyAnswers**](#quizanswercontrollerfindmyanswers) | **GET** /api/quiz/answers/me | Получить ответы текущего игрока|

# **quizAnswerControllerCreate**
> quizAnswerControllerCreate(createQuizAnswerDto)

Принимает ID вопроса, выбранный ответ и (опционально) сцену, сохраняет их в базе.

### Example

```typescript
import {
    QuizAnswersApi,
    Configuration,
    CreateQuizAnswerDto
} from './api';

const configuration = new Configuration();
const apiInstance = new QuizAnswersApi(configuration);

let createQuizAnswerDto: CreateQuizAnswerDto; //

const { status, data } = await apiInstance.quizAnswerControllerCreate(
    createQuizAnswerDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createQuizAnswerDto** | **CreateQuizAnswerDto**|  | |


### Return type

void (empty response body)

### Authorization

[session](../README.md#session)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Ответ принят |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **quizAnswerControllerFindAll**
> Array<QuizAnswerResponseDto> quizAnswerControllerFindAll()

Доступно только администраторам. Возвращает список всех ответов на викторины для аналитики.

### Example

```typescript
import {
    QuizAnswersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new QuizAnswersApi(configuration);

const { status, data } = await apiInstance.quizAnswerControllerFindAll();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<QuizAnswerResponseDto>**

### Authorization

[session](../README.md#session)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Список всех ответов |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **quizAnswerControllerFindMyAnswers**
> Array<QuizAnswerResponseDto> quizAnswerControllerFindMyAnswers()

Возвращает список всех ответов викторины, которые отправил авторизованный пользователь.

### Example

```typescript
import {
    QuizAnswersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new QuizAnswersApi(configuration);

const { status, data } = await apiInstance.quizAnswerControllerFindMyAnswers();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<QuizAnswerResponseDto>**

### Authorization

[session](../README.md#session)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Список ответов игрока |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

