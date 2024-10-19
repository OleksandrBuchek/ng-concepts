# Composable Side Effects With Zero Boilerplate

Side effects and state management are central concepts in frontend development, shaping how modern applications interact with the outside world and manage internal data flow.
Effective management of these is crucial because they enable the application to perform meaningful work—side effects allow an application to "do" things, while state ensures that these actions are consistently reflected across the user interface.
Over the years, the strategies for managing both state and side effects have evolved alongside the increasing complexity of modern web applications.

During this time, we’ve been able to identify common scenarios developers frequently encounter.
While state management has seen significant improvements—especially with the introduction of signal-based stores—side effects remain a pain point.
Developers still face many challanges which have persisted for years.
However, with Angular’s introduction of two powerful features—`runInInjectionContext` and `DestroyRef`—a promising solution has emerged.
These features offer new opportunities to address the complexities of managing side effects more effectively, making applications more maintainable and scalable, while drastically reducing the need for excessive boilerplate in handling typical scenarios.

In this article, we’ll briefly explore how approaches to state management and side effects have evolved over time.
Then, we’ll focus specifically on side effects, examining the challenges developers have faced in managing them and how these new features may finally offer a permanent solution.

## A Brief History Of ~~Mankind~~ State Management and Side Effects

Before diving deeply into side effects, it’s important to first recap what the industry has learned over the years—what mistakes have been made and what solutions have been invented. We won’t delve into the specifics of each approach, as this article assumes the reader already has a solid understanding of them. Instead, we’ll focus on the key points and takeaways.

### Why Not Just Use Services? Keeping It ~~Simple~~Stupid, Right?

In the early days of web development with Angular, state management and side effects were handled directly within services. The approach was simple: make a request, wait for the response, and handle it within the component using observables or an async pipe:

```ts
@Injectable({ providedIn: 'root' })
export class TodoService {
  constructor(private http: HttpClient) {}

  public hasError$: Subject<boolean>;
  public isLoading$: Subject<boolean>;

  public getTodos(): Observable<Todo[]> {
    this.isLoading.next(true);
    return this.http.get<Todo[]>('https://api.example.com/todos').pipe(
      catchError((error: Error) => {
        this.handleError(error);
        this.isLoading$.next(false);
      }),
      tap(() => {
        this.isLoading$.next(false);
      }),
    );
  }

  private handleError(error: Error): void {
    //Error handling
  }
}
```

While this approach worked for very small apps, it quickly becomed unscalable. Problems like service orchestration—where services depended on one another—and a lack of separation of concerns emerged. Error handling, API fetching, and state management were all crammed into one place. This led to tightly coupled code, making maintenance and scalability difficult. The main disadvantage of this approach can be summarized as the absence of a proper architecture.

"If you're building a system that will be in production for more than a couple of months, you'll want to invest in a solid architecture. A good architecture makes the system easier to change and evolve, which is the key to long-term success." (Patterns of Enterprise Application Architecture, Martin Fowler)

### Event-Driven dogma – Everything Should Be an Event!

To address the challenges of tightly coupled code and poor separation of concerns, the Flux architecture and the Redux pattern gained significant popularity. These patterns are built on two fundamental concepts: event-driven architecture and Command Query Responsibility Segregation (CQRS). Components do not directly interact with services but are solely responsible for dispatching actions. Side effects, such as API calls or other asynchronous operations, are managed by effects classes, while reducers handle state transitions based on the dispatched actions. This clear division of responsibilities enhances scalability and maintainability, allowing developers to manage complex application flows more efficiently. Let's take the `NgRx` library as an example:

```ts
// Actions
export const loadTodos = createAction('[Todo] Load Todos');
export const loadTodosSuccess = createAction('[Todo] Load Todos Success', props<{ todos: Todo[] }>());
export const loadTodosFailure = createAction('[Todo] Load Todos Failure', props<{ error: Error }>());

// Effect
@Injectable()
export class TodoEffects {
    constructor(
        private actions$: Actions,
        private todoService: TodoService
    ) {}

    public readonly loadTodos$ = createEffect(() => this.actions$.pipe(
        ofType(loadTodos),
        switchMap(() =>
            this.todoService.getTodos().pipe(
                map(todos => loadTodosSuccess({ todos })),
                catchError(error => of(loadTodosFailure({ error })))
        )
    )
));

// Reducer
export const todoReducer = createReducer(
    initialState,
    on(loadTodos, (state) => ({ ...state, isLoading: true }))
    on(loadTodosSuccess, (state, { todos }) => ({ ...state, isLoading: false, todos })),
    on(loadTodosFailure, (state, { error }) => ({ ...state, isLoading: false, error }))
);
```

However, a significant drawback of the event-driven approach was the overwhelming amount of boilerplate code it required, along with its lack of modularity.
A particularly frustrating aspect was the need to repeatedly define nearly identical actions for common scenarios, such as loading, success, and failure.
Developers found themselves duplicating code, with only minor changes to action names.
In an effort to address the ever-increasing amount of boilerplate, the industry began shifting towards the class based approach, which we will discuss next.

### The Classes Dogma – Since Angular relies on classes everywhere, we must do the same, right?

With Angular’s heavy reliance on classes, many developers naturally assumed that state management should follow the same pattern.
Frameworks like Akita embraced this philosophy by emphasizing modularity through various types of classes, such as entity stores and queries.
This class-oriented approach allowed developers to encapsulate logic more effectively.
However, while it helped with separation of concerns, it still posed orchestration challenges, as managing multiple interdependent classes could become complex.
This echoed some of the same difficulties developers faced with services, albeit with better organization.
Ngrx also introduced it's class based solution with the introduction of Components Store in an attempt to tackle the modularity and boilerplate issue.

### Application is Just a Bunch of Features Composed Together

Both event-driven and class-based approaches share a fundamental flaw: they are not well composabable.
What happens when we need to combine various types of functionality—such as managing an entities store, and enhancing it with a loading store, filter store, table store, along with some custom store logic?

This is when both approaches begin to show their rigidity, as they don't provide a consistent interface for composing multiple mini stores into a larger, cohesive store.
However, the true essence of software design is that building an application involves breaking down a complex problem into smaller, manageable ones.
Each smaller problem—often represented by a feature—is solved by different parts of the codebase, and these parts are then composed together to create a unified system.
Unfortunately, focusing on feature composition has been the missing piece of the puzzle.

The reason both approaches struggle to be truly composable is simple:

Composition is inherently more difficult with classes: Class-based inheritance is rigid and unsuitable when combining different types of functionality. Class-oriented stuff like decorators, class mixins, and implementation inheritance make customization and composition hard and inconsistent.

As for the event-driven approach, one of its biggest challenges is the need to define unique action for every interaction or flow.
This requirement for uniqueness severely limits the reusability of actions, as each action becomes tied to a specific context.
Even when the same logical flow is needed elsewhere in the application, a new action must be created—often with a similar name but bound to a different reducer.
This creates a tight coupling between actions and reducers, making it difficult to compose or reuse logic across different parts of the application.
In other words, the main issue with this approach is its lack of encapsulation.
Each action, reducer, and effect is closely mutually intertwined, which prevents efficient reuse of common flows and increases the maintenance burden.

Moreover, the flat store philosophy doesn’t work well with nested structures like entities, requiring additional tools, such as NgRx Entity.
While NgRx Entity simplifies managing collections of entities, it introduces its own API and patterns, leading to a fragmented codebase where multiple approaches must be combined.

### The State Management Renessaince With Functional Mixins

The real breakthrough came with the introduction of the Elf.js library. By moving away from classes and actions with reducers for managing a state and embracing plain JavaScript objects and functional mixins, Elf.js offered a more flexible and composable solution. This composition-based approach provided an unprecedented level of flexibility, allowing developers to dynamically compose feature stores with the exact functionality they needed while still preserving a consistent interface:

```ts
import { createStore, withProps, withEntities } from '@ngneat/elf';

class TodoRepostory {
  private readonly store = createStore(
    { name: 'todo' },
    withProps<{ total: number }>({ total: 0 }),
    withEntities<Todo>({ idKey: 'id' }),
    withRequestsStatus(initializeAsPending('todos')),
    withTableStore(),
    withFiltersStore(),
  );
}
```

This flexibility gave developers the power of JavaScript’s native features, such as object concatenation with the `Object.assign` or `spread` operator, without the overhead of managing classes. It was a turning point that shifted state management toward a more functional, composable, and scalable approach.

### Signal stores

After the introduction of signals, there have been, and continue to be, many discussions around their best practices, whether they can completely replace observables, and how they fit into the larger ecosystem. However, it is safe to say that the general consensus is that signals are an ideal solution for state management. Signals offer a simpler and more intuitive approach for managing reactive state in many scenarios, making them a powerful tool in modern Angular applications. By leveraging functional composition and the reactivity of signals, developers can build highly modular, scalable, and dynamic stores, eliminating much of the boilerplate while keeping the core logic clean and reusable. Therefore, it's incredibly exciting that modern libraries implementing signal stores like `NgRx Signal Store` are based on the concept of functional mixins:

```ts
const todoStore = new signalStore(
    withEntities<Todo>({ selectId: (entity: Todo) => entity.id }),
    withRequestStatus(),
    withTableStore(),
    withFiltersStore(),
    withMethods((store) => ({...})),
    withComputed((store) => ({...}))
);

todoStore.setRequestStatus('Loading');
todoStore.setFilter(...);
todoStore.setEntity(todo);
todoStore.nextPage();
todoStore.previousPage();


```

### Alright, But What About Side Effects ?

Even though the industry has learned its lesson and rethought state management, side effects management hasn't yet had its renaissance. The evolution of handling side effects can be briefly summarized as follows: First, we extracted side effects management into dedicated effect classes to improve the separation of concerns, allowing effects to be invoked when an action was dispatched, which provided better decoupling. However, we soon realized that event-driven approaches could become overwhelming, leading to overly complex flows. This sparked the invention of functional effects, which can be invoked like regular methods while automatically managing subscriptions under the hood. And that’s the story so far.

But did it solve the problem of complexity and reusability? Not entirely. The challenges have largely remained the same. Now is the time to dive deeper into effects to understand what these challenges are, why they have persisted for years, and how we can rethink effects using new Angular features to finally address them.

## Side Effects Management Has Always Been Challenging

Let's go through the most common challanges developers encounter while writing side effects:

- `Interdependency of Side Effects`: Sometimes side effects are dependent on the outcome of previous effects or actions. Managing these dependencies in a clean, predictable way can be difficult:

```ts
export class CheckoutEffects {
    private readonly actions$ = inject(Actions);
    private readonly dialog = inject(MatDialog);
    private readonly cardLimitApi = inject(CardLimitApi);
    private readonly checkoutApi = inject(CheckoutApi);

    // 1. First, we need to check if the given bank account has sufficient money on its balance
    public readonly checkAccountLimit = createEffect(() => this.actions$.pipe(
        ofType(checkAccountLimit),
        switchMap((checkoutPayload: CheckoutPayload) =>
            this.cardLimitApi.isLimitExeeded(checkoutPayload.sum, checkoutPayload.bankAccount).pipe(
                map(isExeeded => isExeeded ? accountLimitExceeded(checkoutPayload) : accountLimitCheckPassed(checkoutPayload)),
                catchError(error => of(checkLimitFailed({ error })))
        ))
    ));

    // 2. Then, we need to get confirmation from the user to ensure they have double-checked the final information
    public readonly confirmCheckout = createEffect(() => this.actions$.pipe(
        ofType(accountLimitCheckPassed),
        switchMap((checkoutPayload) => this.dialog.open(MyDialog).afterClosed().pipe(
            defaultIfEmpty(false),
            map((isConfirmed) => isConfirmed ? checkoutConfirmed(checkoutPayload) : noopAction()),
        ))
    ));

    // 3. Finally, once all checks have passed, we can proceed with the checkout process
    public readonly checkout = createEffect(() => this.actions$.pipe(
        ofType(checkoutConfirmed),
        switchMap((checkoutPayload) =>
            this.checkoutApi(checkoutPayload).pipe(
                map(() => checkoutSuccess()),
                catchError(error => of(checkoutFailure({ error })))
        ))
    ));

    public accountLimitExceeded = createEffect(() => ...);
    public checkoutFailure = createEffect(() => ...);
    public checkLimitFailed = createEffect(() => ...);
));

```

Even though each effect has its own responsibility and is easy to read individually, the mental overload becomes inevitable. To build an end-to-end flow in our minds, we must scroll through multiple effects, piecing everything together individually. The codebase is not structured in a way that allows us to understand the entire flow at a glance; it always requires deeper investigation.

As we try to construct this chain of events, we quickly realize that, although everything is described as effects, only the checkout effect actually performs meaningful actions and has an impact on the application. Both checkAccountLimit and confirmCheckout are not truly independent effects, as each one merely triggers the next in the sequence. None of these effects is expected to be executed separately, which introduces another challenge: payload propagation. We need to ensure that the initial payload passed to the checkAccountLimit effect is correctly propagated through the entire flow, ultimately reaching the final checkout effect.

In backend systems, distributed events are useful when managing server capacity or avoiding process blocking. In such cases, the added complexity of distributed event systems is justified. However, in the frontend, we don't face those same concerns. The need for loose couple is als ocannot used justification here since these events are acually part of logic code module. Therefore, having a class with multiple effects simply responsible for dispatching the next effect in the sequence, which will be executed immediately after in the same class, seems unnecessary and even absurd. This approach doesn't simplify the process; in fact, it complicates it further, with no real benefit in terms of reduced complexity.

- `Manual loading state and error handling orchestration`:

Let's rewrite the previous code snippet to use the function effects:

```ts
export class CheckoutEffects {
    private readonly actions$ = inject(Actions);
    private readonly dialog = inject(MatDialog);
    private readonly cardLimitApi = inject(CardLimitApi);
    private readonly checkoutApi = inject(CheckoutApi);
    private readonly notification = inject(NotificationService);

    private repo = inject(CheckoutRepository);

    public readonly checkAccountLimit = createEffect(
        pipe(
            tap(() => {
                // Here we mark the checkout loading state as loading to make sure we display the loading inidactor from the very start
                this.repo.checkout.setLoadingState('Loading');
            }),
            switchMap((checkoutPayload: CheckoutPayload) =>
                this.cardLimitApi.isLimitExeeded(checkoutPayload.sum, checkoutPayload.bankAccount).pipe(
                    tap(isExeeded => {
                        if(isExeeded) {
                            this.handleLimitExceeded();
                            // Stop loading since the check didn't pass
                            this.repo.checkout.setLoadingState('Idle');
                        } else {
                            this.confirmCheckout(checkoutPayload);
                        }
                    }),
                    catchError(error => {
                        // Stop loading since the account limit check request failed
                        this.repo.checkout.setLoadingState('Failed');
                        this.handleLimitCheckError();
                    })
            )
        )
    ));

    public readonly isCheckoutConfirmed = createEffect(
      pipe(
        switchMap((checkoutPayload) => this.dialog.open(MyDialog).afterClosed().pipe(
            defaultIfEmpty(false),
            tap((isConfirmed) => {
                if(isConfirmed) {
                  this.checkout();
                } else {
                  // Stop loading since the user didn't confirm the chekout
                  this.repo.checkout.setLoadingState('Idle');
                }
            ),
        )
      )
      )
    )

    public readonly checkout = createEffect(
        pipe(
            switchMap((checkoutPayload) =>
                this.checkoutApi(checkoutPayload).pipe(
                    tap(() => {
                      // Stop loading since the the process was successfull
                      this.repo.checkout.setLoadingState('Success');
                    }),
                    catchError(error => {
                      // Stop loading since the the cehckout request failed
                      this.repo.checkout.setLoadingState('Failed');
                      this.handleChechoutFailure();
                    })
            ))
        )
    );


    public accountLimitExceeded = createEffect(() => ...);
    public checkoutFailure = createEffect(() => ...);
    public checkLimitFailed = createEffect(() => ...);
));
```

Even though we've reduced the need for excessive action dispatching by adopting function-based effects, the overall complexity hasn't significantly improved. What we see now is a set of tightly coupled, interdependent methods where one function's success or failure directly drives the next step in the flow. This shift has introduced new challenges, particularly in managing loading states. In the event-driven approach, we also need to manage the loading state, but this logic is typically handled separately in the reducer, which reduces boilerplate within the effects themselves. Now, these aspects need to be orchestrated manually throughout the chain of effects. Each effect is responsible for explicitly setting the loading state at different stages (Loading, Idle, Success, Failed), adding to the cognitive load and the potential for mistakes, making the code harder to manage, extend, and maintain. We could have created one large RxJS stream instead of multiple effect functions to represent a single flow, but it wouldn’t reduce the complexity or simplify orchestration.

The same issue arises with error management: each step requires its own custom error handling logic, along with potentially invoking a shared error handler for the entire end-to-end process. This not only adds complexity but also makes the flow harder to maintain and reason about.

There are practices that involve partially extracting error handling into interceptors, especially for handling generic errors like 500 responses, or providing a shared error handler at the module or component level. While these approaches help reduce boilerplate, they come at the cost of flexibility and customization. What happens if we need to override the existing behavior or customize the error message for a specific effect? These scenarios become difficult to handle, leaving us with rigid error management structures that are hard to adapt.

- `Effects Are Not Well Composable`

No matter which approach we use—whether event-driven or function-based—the problem remains that composing and reusing side effects is extremely difficult. This is the root cause of the challenges in orchestrating dependent flows, as well as handling lazy-loading, error management, and other complexities mentioned earlier. Instead of having modular, reusable units of logic, side effects are often tightly coupled to specific actions or flows, making it challenging to compose or reuse them across different parts of the application. This lack of composability forces developers to duplicate code rather than create flexible, reusable effects that can be combined to handle more complex scenarios. As a result, the system becomes rigid, reducing maintainability and scalability over time.

### The main pitfall to composable effects

If we look back and rethink the history of state management—the mistakes we've made—it becomes clear that nothing has prevented us from using the functional mixins approach since the early days of Angular 2. Whether we are using modules or standalone components, injecting dependencies via constructors or with the `inject` function, plain JavaScript objects, functions, and the spread operator have always been available in our toolkit. Even without signals, `BehaviorSubjects` were always at our disposal, offering a powerful way to manage state reactively and handle streams of data over time.

However, things become more complex when dealing with side effects. The main challenge in adopting functional composition for side effects is that effects almost always require dependencies to be injected, such as a dialog service to open a dialog, an API service to send requests, or a notification service to log errors. This need for dependencies makes it extremely difficult to achieve functional composition, as dependency injection is a core part of the effect's behavior.

For a long time, we were restricted and tied to using constructors in components or injectable classes. This limitation made any attempt to make effects more composable with functions not worth the effort, as we would constantly need to manually project dependencies. While some logic could be extracted into dedicated classes for reuse, as mentioned earlier, composing logic with classes is more rigid and far less flexible.

The introduction of the `inject` function has made this process more feasible. Now, we can encapsulate certain logic into reusable functions for our effects. For example, we can create something like this:

```ts

const ifConfirmedViaFactory = () => {
    const dialog = inject(MatDialogRef);

    return <T, D>(component: T, data?: D) => dialog.open<T, D>(component, { data }).afterClosed().pipe(
        defaultIfEmpty(false),
        map((isConfirmed) => isConfirmed),
        take(1)
    );
}


export class CheckoutEffects {
    private ifConfirmedVia = ifConfirmedViaFactory();

    public readonly isCheckoutComfirmed = pipe(
        switchMap((checkoutPayload) => this.ifConfirmedVia(MyDialog).pipe(
            tap((isConfirmed) => {
                if (checkoutConfirmed(checkoutPayload)) {
                    this.checkout();
                } else {
                    this.repo.checkout.setLoadingState('Idle');
                }
            ),
        )
    )
}
```

However, we are still bound to the construction(class's fields initiation) injection context, meaning that we always need to invoke factory functions like `ifConfirmedViaFactory` ahead of time while initialize class fields or in a constructor of a class to take advantage of the `inject` function and project dependencies. While this approach allows us to encapsulate some reusable logic, this limitation leads to boilerplate code. Instead of directly using the injected dependencies, we must rely on invoking these factory functions first, which adds an extra layer of indirection. This additional step makes the code feel more cumbersome.

## `runInInjectionContext` - No more barriers

The main barrier to adopting a fully composable approach for side effects has been the need to inject dependencies "statically". The `runInInjectionContext` function, initially introduced in Angular 14, changes that by allowing you to compose functions more naturally, using dependencies at runtime when they are required. Let's see how it works:

```ts

const ifConfirmedVia = <T, D>(component: T, data?: D) => {
    const dialog = inject(MatDialogRef);

    return dialog.open<T, D>(component, { data }).afterClosed().pipe(
        defaultIfEmpty(false),
        map((isConfirmed) => isConfirmed),
        take(1)
    );
}


export class CheckoutEffects {
    private injector = inject(Injector);

    public readonly isCheckoutComfirmed = pipe(
        switchMap((checkoutPayload) => runInInjectionContext(this.injector, ifConfirmedVia(MyDialog)).pipe(
            tap((isConfirmed) => {
                if (checkoutConfirmed(checkoutPayload)) {
                    this.checkout();
                } else {
                    this.repo.checkout.setLoadingState('Idle');
                }
            ),
        )
    )
}
```

I know what you are thinking. Indeed, at first glance, the overhead of injecting the `Injector` and repeatedly calling `runInInjectionContext` might appear to increase complexity and clutter the codebase. However, by abstracting this logic into helper functions, we can completely remove manual injection logic, allowing developers to focus on composing business logic rather than managing dependency injection.

This is where the true power of `runInInjectionContext` comes into play: once we have a well-structured abstraction layer, we can manage the injection context seamlessly. It's time to demonstrate how to leverage these abstractions and the incredible benefits they bring to side effect management.

### Prerquisites

Before we start it is important to define which solution are we going to use for our state managemnt in our code snippets. It is not a coinicance that a good part of our article was dedicated to state management. We have discovered that the holy grail to a good statemengemtn is by using fucntional mixins, an approach implemented by NgRx Signal store. So, we will use it to demonstrate how it can greatly be combined with composable side effects managemnet that we are going to talk about futher.

As a first step, let's build a couple of reusable feature stores needed for a request, like request status, error propagation and loading state:

1. Request status

```ts
export type RequestStatus = 'Idle' | 'Loading' | 'Success' | 'Failed';

export function withRequestStatus() {
  return signalStoreFeature(
    withState<{ requestStatus: RequestStatus }>({ requestStatus: 'Idle' }),
    withMethods((store) => ({
      setRequestStatus(requestStatus: RequestStatus): void {
        patchState(store, { requestStatus });
      },
    })),
    withComputed((store) => ({
      isLoading: computed(() => store.requestStatus() === 'Loading'),
      isLoaded: computed(() => store.requestStatus() === 'Success'),
      isFailed: computed(() => store.requestStatus() === 'Failed'),
      isIdle: computed(() => store.requestStatus() === 'Idle'),
    })),
  );
}
```

2. Error

```ts
export function withError<TError = HttpErrorResponse>() {
  return signalStoreFeature(
    withState<{ error: AppError<TError> | null }>({ error: null }),
    withMethods((store) => ({
      setError(error: AppError<TError> | null) {
        patchState(store, { error });
      },
    })),
  );
}
```

3. Loading state

```ts
const getLoadingState = (store: GetLoadingStateParams): Signal<LoadingState> =>
  computed(() => {
    const error = store.error();
    const status = store.requestStatus();

    const result = status === 'Success' ? { status } : status === 'Failed' ? { status, error } : { status };

    return result as LoadingState;
  });

export const withLoadingState = <_>() => {
  return signalStoreFeature(
    {
      state: type<{
        error: AppError<HttpErrorResponse> | null;
        requestStatus: RequestStatus;
      }>(),
    },
    withComputed((store) => ({
      loadingState: getLoadingState(store),
    })),
  );
};
```

Then let's compose it into a more complex feature store called `callState`:

```ts
export const withCallState = () => {
  return signalStoreFeature(withRequestStatus(), withError(), withLoadingState());
};

export const callStateStore = () => createInstance(signalStore(withCallState()));
```

Since the result of the `signalStore` is class, to avoid using the `new` keyword we will use the `createInstance` helper function to remove depencenies on clasess in our codebase:

```ts
export const createInstance = <TValue>(storeFactory: new () => TValue): TValue => new storeFactory();
```

### rxRequest

As we mentioned earlier, dynamic context binding with runInInjectionContext becomes truly powerful when proper abstractions are created. Let's build a helper function to handle HTTP requests and encapsulate the injection orchestration behind the scenes. We'll call this helper function rxRequest, similar to rxMethod from NgRx:

```ts
export interface RequestStore {
  setError(error: AppError<HttpErrorResponse> | null): void;
  setRequestStatus(status: RequestStatus): void;
}

export interface RxRequestOptions<Input = void, Response = unknown> {
  requestFn: (input: Input) => Observable<Response> | Promise<Response>;
  store?: Partial<RequestStore> | null;
  // ...Other options
}

export const rxRequest = <Input = void, Response = unknown>(options: RxRequestOptions<Input, Response>) => {
  const injector = inject(Injector);

  const runPipeline = rxMethod(getRxRequestPipeline(options));

  return (input: ValueOrReactive<Input>) => {
    return runPipeline(withInjector(input, injector));
  };
};
```

First, we define the RequestStore interface and the RxRequestOptions interface for the options our helper function will accept. We expect requestFn as a required option—this is a function that takes an Input, performs the request and returns either an Observable or a Promise of type Response.

Additionally, we accept an optional store property of type RequestStore. This interface is highly flexible and doesn't enforce any concrete state management implementation. It only requires a simple object with methods for setting the request status and error, keeping separation of concerns intact. This reduces coupling between state management and side effects, allowing for clean, maintainable code.

Next, our helper function rxRequest encapsulates dependency injection. It uses the inject function to inject the Injector dynamically. We then leverage the rxMethod function (from NgRx) to pass an RxJS pipeline, composed based on the properties defined in our options. The returned function expects an input, which can be either a value or a reactive type (such as an Observable or a Signal). Inside this function, we invoke the pipeline, passing the actual input together with the injector as part of the observable stream. We will discuss the motication slighly later.

Now, with rxRequest, we can easily handle a typical scenario: sending a request, tracking its loading status, and managing any HTTP errors—all in one place.

Instead of manually managing the loading state and error handling in each effect, we invoke the callStateStore function to generate a composed store that encapsulates the common logic for managing the lifecycle of a request with built-in methods. Then, instead of calling these methods manually at different points in the request pipeline, we simply pass the store to rxRequest function, which handles everything under the hood.

Creating as store to track the state of the checkout request in our Repository class:

```ts
export class CheckoutRepository {
  public readonly checkoutCallStore = callStateStore();
}
```

In the CheckoutEffects class, we define the checkout effect using rxRequest. The request function (requestFn) is defined to send the payload to the checkout API, allowing us to directly inject API services within the requestFn body. The store property uses the checkoutCallStore to manage the loading and error states automatically:

```ts
export class CheckoutEffects {
  private readonly repo = inject(CheckoutRepository);

  public readonly checkout = rxRequest<CheckoutPayload>({
    requestFn: (payload) => inject(CheckoutApi).checkout(payload),
    store: this.repo.checkoutCallStore,
  });
}
```

Finally, in the CheckoutFacade, we use the checkoutCallStore to expose the loading status and initiate the checkout process:

```ts
export class CheckoutFacade {
  private readonly effects = inject(CheckoutEffects);
  private readonly repo = inject(CheckoutRepository);

  public readonly $isCheckoutLoading: Signal<boolean> = this.repo.checkoutCallStore.isLoading;

  public checkout(payload: CheckoutPayload): void {
    this.effects.checkout(payload);
  }
}
```

By using rxRequest, we simplify handling HTTP requests by automating loading state tracking and centralizing error handling.
The store updates the request status (Loading, Success, or Error) automatically, while reducing boilerplate code. rxRequest abstracts the complexity of the request lifecycle, providing flexibility through options like requestFn and store. This eliminates the need to manually manage status changes or errors, improving code readability and maintainability.

Let's see how this is done under the hood:

```ts
const getPipeline = <Input = void, Response = unknown>(
  performRequestPipeline: RxInjectablePipeline<Input, Response>,
  options: RxRequestOptions<Input, Response>
) => {
    const pipeline = pipe(
        tap<RxInjectablePipelineInput<Input>>(({ injector }) => {
            options.store?.setRequestStatus?.('Loading');
        }),
        switchMap(({ input, injector }: RxInjectablePipelineInput<Input>) => {
            return performRequestPipeline(({ input, injector })).pipe(
                tap((response) => {
                    options.store?.setRequestStatus?.('Success');
                    options.store?.setError?.(null);

                    runInInjectionContext(injector, () => {
                        options.onSuccess?.(response);
                    });
                }),
                catchAppError((error) => {
                    options.store?.setError?.(error);
                    options.store?.setRequestStatus?.('Failed');

                    runInInjectionContext(injector, () => {
                        handleError(error);
                        options.onError?.(response);
                    })
                })
            );
        })
    );
}

  return pipeline;
};

```

The `getPipeline` function returns a reusable pipeline to handle tht request lifesycle. As we alrady mentioned, we are passing an inejctot along with the request input. This enables us the use of `runInInjectionContext` to dynamically inject services at any point in the pipeline: either for for request invocation, as well as success and error handling, all while keeping the actual implementation of decoupled and abstracted.

You might be wondering, why couldn't we just pass an injector as paramter of the `getPipeline` and not pass it as rxjs stream input. To answer to that question, let's dive into more advanced scenarios to show you the full power of what can be done with dunamic injection context.

### Depdepndent effects orchstration made easy

Let's comeback and refactor our initial example with interdependent effects where we checking the account balance limit and and requiring a user to comfirm the checkout in a dialog window.

Let's first create a couple of reusable helper functions that can abstract some logic related to opening a dialog and sedning a request that will return a bollean indicating if the main effect can take place.

First, let's start with dialogs:

```ts
const ifConfirmedVia = <T, D>(component: T, data?: D) => {
  const dialog = inject(MatDialogRef);

  return () => {
    return dialog
      .open<T, D, boolean>(component, { data })
      .afterClosed()
      .pipe(
        defaultIfEmpty(false),
        map((isConfirmed) => Boolean(isConfirmed)),
      );
  };
};
```

Nothing special, we are just defining a function that expects a dialog component to be passed as paramter and return the otehr function that, when called opens a dialog and waits for it response.

Now, let's define a helper function to call a request that will serve as a can activate guard:

```ts
const if = <Input = void>(requestFn: (input: Input) => Observable<boolean>) => {
  const store = dataStore<boolean | null>(null);

  const performRequest = rxRequest({
    requestFn
    store,
    onSuccess: (data) => {
      store.setData(data);
    }
  });

  return (): Observable<boolean> => {
    performRequest();

    return asObservable(store.loadingState).pipe(
      withLoadedData,
      map((result) => Boolean(result))
    );
  };
};
```

The last thing to note here is this:

```ts
const store = dataStore<boolean | null>(null);
```

Now, since we are expecting some data to be retuned from the backend instead of just sending a command with no body response expected we need to create a different type of a store that will allow us to store this data. That's why the `dataStore` function is used, it resuse the same feature stores used from the `callStateStore` but with the only difference that now we can popualte data:

```ts
export function withData<TData>(defaultValue: TData) {
  return signalStoreFeature(
    withState<{ data: TData }>({ data: defaultValue }),
    withMethods((store) => ({
      setData(data: TData) {
        patchState(store, { data });
      },
      clearData() {
        patchState(store, { data: defaultValue });
      },
    }))
  );
}

export const withDataStoreFeature = <TData>(defaultValue: TData) => {
  return signalStoreFeature(
    withData(defaultValue),
    withRequestStatus(),
    withError(),
    withDataLoadingState(...)
  );
};

export const dataStore = <TData>(defaultValue: TData) => {
  return createInstance(signalStore(withDataStoreFeature(defaultValue)));
};
```

Now, let's take a look at our refactord checkout effects:

```ts
const checkLimit = (payload) => inject(CardLimitApi).isLimitExeeded(checkoutPayload.sum, checkoutPayload.bankAccount);

export class CheckoutEffects {
  private repo = inject(CheckoutRepository);

  public readonly checkout = rxRequest<CheckoutPayload>({
    requestFn: (payload) => inject(CheckoutApi).checkout(payload),
    canActivate: concat(
      if(checkLimit), 
      ifConfirmedVia(CheckoutConfirmationDialogComponent)
    ),
    store: this.repo.checkoutCallStore,
  });
}
```

We are passing the `canActivate` property which is basically a function that recieves an input and injector and returns a boolean value or a reactive containing a bolean value:

```ts

export type CanActivateGuardFn<Input = void> = (input: Input, injector: Injector) => ValueOrReactive<boolean>;

export interface RxRequestOptions<Input = void, Response = unknown> {
  ...
  canActivate?: CanActivateGuardFn<Input>;
}
```

Since all dependency injection orchestration and inpur propagation is orchestrated by the `rxRequest`, we can combine our streams however we want and concetraete on the business logic. Such a hard logic and sequntal interdependnt streams becomes a task that any junior developer can easily implement relying on the toolkit that we have now. All we need to do is use a high order `concat` function and pass our guards functions to it as paramters. Then, eveything else will be passed by the rxRequest inner logic:

```ts
import { from, concatMap, every, take } from 'rxjs';

export const concat = <Input>(...guardFns: Array<CanActivateGuardFn<Input>>): CanActivateGuardFn<Input> => {
  return (input, injector): Observable<boolean> => {
    return from(guardFns).pipe(
      concatMap((guardFn) =>
        runInInjectionContext(injector, () => asObservable(guardFn(input, injector)).pipe(take(1))),
      ),
      every((value) => value),
    );
  }

};
```

If we want to change the logic and make sure conditions are executed simultenialsy and them combine the resolved results we can do it by defining a couple of new functions:

```ts
const combineGuardResults = (predicate: (results: boolean[]) => boolean) => {
  return <Input = void>(...guardFns: Array<CanActivateGuardFn<Input>>) => {
    return (input: Input, injector: Injector): Observable<boolean> => {
      return combineLatest(
        runInInjectionContext(injector, () =>
          guardFns.map((guardFn) => asObservable(guardFn(input, injector)).pipe(take(1))),
        ),
      ).pipe(map((values) => predicate(values)));
    }
  };
};

export const every = combineGuardResults((values) => values.every((value) => value));
export const some = combineGuardResults((values) => values.some((value) => value));
```

```ts
    rxRequest({
      ...
      canActivate: every(
        if(checkLimit),
        ifConfirmedVia(CheckoutConfirmationDialogComponent)
      ),
    })
```

Or, if we get even more complex conditional scenarios, where can implement them since the functional compoistion is at our disposal without any barriers:

```ts
    rxRequest({
      ...
      canActivate: concat(
        every(
          if(checkLimit),
          some(
            if(checkAccountOne),
            if(checkAccountTwo),
          )
        ),
        ifConfirmedVia(CheckoutConfirmationDialogComponent)
      ),
    })

```

The collest part is that now, we can understand the flow without any cognitive overload since functions names are self-explinitory.

### Souces instead of anemic actions

Traditionally, sticking to the event-driven dogma, we viewed actions as mere triggers carrying an anemic payload, devoid of any real behavior. The actual initiation of the stream typically occurred within one of our effects, leading to complex interdependent chains, as discussed earlier.

By shifting our mindset to view effects as composed reactive streams and leveraging the power of runInInjectionContext, we can move beyond using actions solely as messages. Instead, we can shift the logic of initiating the stream into action payload factories, since these functions can now be invoked with the ability to inject dependencies directly. This allows them to perform asynchronous tasks that initiate the stream more naturally. In this way, actions become more powerful, acting as reactive sources that encapsulate both the payload resolving and the behavior required to kickstart the stream.

To demostrate it let's take a look at an example with a form, which draft we are retriveing from the backend, and if a draft has been previosly saved while filling the form at last time, we are dispalying a confriamtion dialog that propose to as uer to apply teh last saved cahnges. If a draft hasn't been saved - do nothing.

Let's first create an action that will initiate the stream. It will send a request a server, check for a saved draft and return an obseravale that will only emit a payload if a draft is returend from the backend:

```ts
const getCheckoutFormDraft = createAction('Fetch checkout form draft', () => {
  const store = dataStore<CheckoutFormDraft>();

  const getDraft = rxRequest({
    requestFn: () => inject(CheckoutService).getDraft(),
    store,
  });

  getDraft();

  return asObservable(store.loadingState).pipe(
    withLoadedData,
    filter((draft) => Boolean(draft)),
  );
});
```

Then, to listen and react to these actions we will introduce new helper called `rxEffect`:

```ts
class MyEffects {
  private readonly form = inject<FromGroup<CheckoutFormDraft>>(CHECKOUT_FORM);

  public readonly applyCheckoutFormDraft = rxEffect<CheckoutFormDraft>({
    sources: [getCheckoutFormDraft],
    canActivate: ifConfirmedVia(ConfirmCheckoutFormDraftApplicationDialogComponent),
    effectFn: rxMethod(
      pipe(
        tap((draft: CheckoutFormDraft) => {
          this.form.patchValue(draft);
        }),
      ),
    ),
  });
}
```

The `rxEffect` if a high order helper function dedicated to listen to events or to be inkoved manually as a regular method. It can also filter a stream with the canActivate property and them it inkoves. It expected the effectFn which is going to called eveytime the rxEffect function is invoked or of of it sources emits a value and the canActive guurds return true

```ts
export interface RxEffectOptions<Input = void> {
  effectFn: (input: ValueOrReactive<Input>, injector: Injector) => void;
  sources?: Array<Action<Input> | Observable<Input>>;
  canActivate?: CanActivateGuardFn<Input>;
  ...
}

export const rxEffect = <Input = void>(options: RxEffectOptions<Input>) => {
  const injector = inject(Injector);
  ...
  return (input: ValueOrReactive<Input>): void => {
    options.effectFn(input, injector);
  };
}
```

Now, to dispatch an even all we need to to is to call a function:


```ts
export class CheckoutFacade {
  constructor() {
    getCheckoutFormDraft();
  }
}

```