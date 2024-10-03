# Composable Side Effects With Zero Boilerplate

Side effects and state management are central concepts in frontend development, shaping how modern applications interact with the outside world and manage internal data flow. Effective management of these is crucial because they enable the application to perform meaningful work—side effects allow an application to "do" things, while state ensures that these actions are consistently reflected across the user interface. Over the years, the strategies for managing both state and side effects have evolved alongside the increasing complexity of modern web applications.

During this time, we’ve been able to identify common scenarios developers frequently encounter. Modern tools and libraries now focus on reducing boilerplate and improving modularity. While state management has seen significant improvements—especially with the introduction of signal-based stores—side effects remain a pain point. Developers still face a ton challanges which have persisted for years.

However, with Angular’s introduction of two powerful features—`runInInjectionContext` and `DestroyRef`—a promising solution has emerged. These features offer new opportunities to address the complexities of managing side effects more effectively, making applications more maintainable and scalable, while drastically reducing the need for excessive boilerplate in handling typical scenarios.

In this article, we’ll briefly explore how approaches to state management and side effects have evolved over time. Then, we’ll focus specifically on side effects, examining the challenges developers have faced in managing them and how these new features may finally offer a permanent solution.

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

    getTodos(): Observable<Todo[]> {
        this.isLoading.next(true);
        return this.http.get<Todo[]>('https://api.example.com/todos').pipe(
            catchError((error: Error) => {
                this.handleError(error);
                this.isLoading$.next(false);
            }),
            tap(() => {
                this.isLoading$.next(false);
            })
        );
    }

    private handleError(error: Error): void {
        //Error handling
    }
}

@Component({
    ...
    template: `
        <ul>
            <li *ngFor="let todo of todos$ | async">
            {{ todos }}
            </li>
        </ul>
    `
})
export class TodoComponent {
    todos$ = this.todoService.getTodos();

    constructor(private todoService: TodoService) {}
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
    on(loadTodos, (state) => ({ ...staet, isLoading: true }))
    on(loadTodosSuccess, (state, { todos }) => ({ ...state, isLoading: false, todos })),
    on(loadTodosFailure, (state, { error }) => ({ ...state, isLoading: false, error }))
);
```

However, a significant drawback of the event-driven approach was the overwhelming amount of boilerplate code it required, along with its lack of modularity. A particularly frustrating aspect was the need to repeatedly define nearly identical actions for common scenarios, such as loading, success, and failure. Developers found themselves duplicating code, with only minor changes to action names. It has also become clear that merely adhering to an event-driven approach doesn't adequately resolve the `complexity` issue. Managing a series of distributed, interdependent events is one of the most challenging aspects of large-scale applications.

In an effort to address the ever-increasing amount of boilerplate, the industry began shifting towards the class based approach, which we will discuss next.

### The Classes Dogma – Since Angular relies on classes everywhere, we must do the same, right?

With Angular’s heavy reliance on classes, many developers naturally assumed that state management should follow the same pattern. Frameworks like Akita embraced this philosophy by emphasizing modularity through various types of classes, such as entity stores and queries. This class-oriented approach allowed developers to encapsulate logic more effectively. However, while it helped with separation of concerns, it still posed orchestration challenges, as managing multiple interdependent classes could become complex. This echoed some of the same difficulties developers faced with services, albeit with better organization. Ngrx also introduced it's class based solution with the introduction of Components Store in an attempt to tackle the modularity and boilerplate issue.

### Application is Just a Bunch of Features Composed Together

Both event-driven and class-based approaches share a fundamental flaw: they focus heavily on concepts like separation of concerns, reduced boilerplate, and modularity, but give little attention to composition and reusability. The true essence of software design is that building an application involves decomposing a complex problem into smaller, manageable ones. Each of these smaller problems is solved by different parts of the codebase, or features, which are then composed together to create a cohesive system. However, the concept of focusing on individual features and their composition has been the missing piece of the puzzle.

The reason why both appoaches fail to be more `composable` is simple:

- Composition is inherently more difficult with classes. Class-based inheritance is rigid and simply unsuitable when we need to combine various types of functionality, such as managing a table store, loading store, filter store, and entities store, all within the same page.

- The event-driven appraoch, with its heavy focus on flow of events, as it may sound contradictory since it was the main issue this aporahc was tryng to solve, creates tight coupling and dependencies, but not between componentes and services but between actions and a conrecte reducer, making it harder to reuse and compose logic across different parts of the application.

### The State Management Renessaince With Functional Mixins

The real breakthrough came with the introduction of the Elf.js library. By moving away from classes and actions for managing a state and embracing plain JavaScript objects and functional mixins, Elf.js offered a more flexible and composable solution. This composition-based approach provided an unprecedented level of flexibility, allowing developers to dynamically compose feature stores with the exact functionality they needed while still preserving a consistent interface:

```ts
import { createStore, withProps, withEntities } from '@ngneat/elf';

class TodoRepostory {
  private readonly store = createStore(
    { name: 'todo' }, 
    withProps<{ total: number }>({ total: 0 }), 
    withEntities<Todo>({ idKey: 'id' }), 
    withRequestsStatus(initializeAsPending('todos')), 
    withTableStore(), 
    withFiltersStore()
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

As we try to construct this chain of events, we quickly realize that, although everything is described as effects, only the checkout effect actually performs meaningful actions and has an impact on the application. Both checkAccountLimit and confirmCheckout are not truly independent effects, as each one merely triggers the next in the sequence. None of these effects can be executed separately, which introduces another challenge: payload propagation. We need to ensure that the initial payload passed to the checkAccountLimit effect is correctly propagated through the entire flow, ultimately reaching the final checkout effect.

In backend systems, distributed events are useful when managing server capacity or avoiding process blocking. In such cases, the added complexity of distributed event systems is justified. However, in the frontend, we don't face those same concerns. Therefore, having a class with multiple effects simply responsible for dispatching the next effect in the sequence, which will be executed immediately after, seems unnecessary and even absurd. This approach doesn't simplify the process; in fact, it complicates it further, with no real benefit in terms of reduced complexity.

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
                // Here we mark the cecjout loading state as loading to make sure we display the loading inidactor from the very start
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

    public readonly isCheckoutComfirmed = pipe(
        switchMap((checkoutPayload) => this.dialog.open(MyDialog).afterClosed().pipe(
            defaultIfEmpty(false),
            tap((isConfirmed) => {
                if(checkoutConfirmed(checkoutPayload)) {
                    this.checkout();
                } else {
                    // Stop loading since the user didn't confirm the chekout
                    this.repo.checkout.setLoadingState('Idle');
                }
            ),
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
                        this.repo.checkout.setLoadingState('Failure');
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

const withConfirmationDialogFactory = () => {
    const dialog = inject(MatDialogRef);

    return <T, D>(component: T, data?: D) => dialog.open<T, D>(component, { data }).afterClosed().pipe(
        defaultIfEmpty(false),
        map((isConfirmed) => isConfirmed),
        take(1)
    );
}


export class CheckoutEffects {
    private withConfirmationDialog = withConfirmationDialogFactory();

    public readonly isCheckoutComfirmed = pipe(
        switchMap((checkoutPayload) => this.withConfirmationDialog(MyDialog).pipe(
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

However, we are still bound to the injection context, meaning we need to invoke factory functions like `withConfirmationDialogFactory` at the constructor phase each time to take advantage of the `inject` function. While this approach allows us to encapsulate some reusable logic, the need to always initiate a function like this can make the approach feel somewhat awkward. Instead of directly using the injected dependencies, we must rely on invoking these factory functions first, which adds an extra layer of indirection. This additional step can make the code feel more cumbersome. Although it provides more flexibility and composability, the manual invocation of these functions introduces a bit of friction into the process.

## Let me introduce you the game changer - `runInInjectionContext`

The `runInInjectionContext` helper function in Angular empowers execution within a specified injection context, permitting the use of Angular's Dependency Injection (DI) system without being confined to any particular component or injectable class. 

Such an approach fosters the creation of standalone features that dynamically leverage DI during execution, enhancing both modularity and flexibility.