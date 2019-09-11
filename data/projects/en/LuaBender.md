# [**Lua Bender** <img src="./data/images/link-icon-2.png" width="25"/>](https://github.com/yongaro/lua_bender)

## **Description**

Lua bender is a header only library that helps generate bindings of C++ functions and classes to Lua.

This project provides templates and macros to handle the automatic wrapping and dispatch of C++ functions, and optionnal object oriented structures to wrap up the Lua C API concepts.  
I currently use this library to develop a C++ game engine and provide either very flexible configuration steps or entirely programmable stages.

The only dependencies for this project are Lua 5.3.5 and C++ 17.

Below is a quick introduction to the problems this projects aims to solve and a short description of the various features.  

**The library and a more complete description and set of examples can be found on the [git repository](https://github.com/yongaro/lua_bender).**

## **Introduction**

Lua is a very lightweight and flexible language that can be easily embedded in a C/C++ application.


Indeed the Lua API is an ANSI C small library, in size, with no third party dependency.  
This compact and standard design allows to integrate it without modification into any project architecture and on any platform with an ANSI C compiler.

However this API has some drawbacks that can become a real problem quite early in a project developpement.

The main downside is the generic function binding systems.  
To boldly sum up the process, the Lua API only register C functions with the following signature.

> ```cpp
> typedef int (*lua_CFunction) (lua_State *L);
> ```

This means that any given C/C++ function must be **manually** wrapped by a lua_CFunction
that will handle, argument loading from the Lua state, function dispatching, and result transmission back to Lua if necessary.

> ```cpp
> // Some random no brain operation
> double some_func(double arg1, int arg2){
>     return arg1 + arg2;
> }
>
> int some_func_binding(lua_State* L){
>     double a1  = luaL_checknumber(L, -1);
>     int    a2  = luaL_checkinteger(L, -2);
>     double res = some_func(a1, a2);
>     lua_pushnumber(L, res);
>     return 1; // The number of returned values.
> }
>
> 
> luaL_Reg binding = {"some_func", some_func_binding};
> ```

The **luaL_Reg** is then given to the Lua API and **some_func** can be called normally from Lua.
> ```lua
> local res = some_func(24, 10)
> ```

As is, this approach involves a constantly growing redundancy in the code base that obviously make the project hard to modify or maintain.

This problem has already a lot of different solutions that can be found [here](http://lua-users.org/wiki/BindingCodeToLua) for instance.  
However at the time of writing this project and description, many of the above mentionned projects have been left aside for several years.  
Some of them are actively maintained and highly efficient but totally wrap and overhaul the original C API.

This projects aims to round the edges of the Lua API and stick to it closely by keeping most of its components optionals, while trying to get some decent performance and a complete set of features.  
That way it may be used entirely or partially in more demanding projects or just for educationnal purposes.



## The Lua Bender solution

### **Functions**

This library answer first to the function binding problem by providing template wrappers and macros that will automatically generate adapted lua_CFunctions.  
These generated functions will automatically load the arguments from the Lua state, call the wrapped function and give back the result to Lua.  

Regarding the differences between the two systems, the template is the complete implementation of this mechanic while the macros only wrap them to reduce verbosity.  

Here is a quick binding example using the Lua Bender macros.

```cpp
// Binding a classic C++ function.
template<typename T>
T test_template(const T& val){
    std::cout << "C++ called from lua with : " << val << std::endl;
    return val;
}

// 1. The function address 
// 2. The return type
// 3. A variadic list of parameters types.
lua_CFunction f = lua_bender_function(test_template<int>, int, const int&);



// Binding a C++ class/struct functions.
struct test_struct{
    void  some_func_1(int val){ /* Some code */ }
    float some_func_2() const { return 42.0f; }
    static void some_static_func(int val){ /* Some code */ }
};

// 1. The structure/class type.
// 2. the same other arguments used for the previous template 
lua_CFunction mf1 = lua_bender_member_function(test_struct, some_func_1, void, int);
lua_CFunction mf2 = lua_bender_const_member_function(test_struct, some_func_2, float);

// Static functions fit the classic function category
lua_CFunction sf1 = lua_bender_function(test_struct::some_static_func, void, int);
```

Associated with a name in a luaL_Reg they can be used as is from the Lua side.


### **Metatables and user data**

Lua offers **metatables** to customize the behavior of its data structures.  
As the name may have hinted, these tables are function collections bound to Lua variables.  

From the Lua side, this allows for instance to customize classic **tables** behaviors, and get some object oriented programming working.

On the C/C++ side of things, **metatables** can be combined with another Lua data type called **user data**.  
These last are a way to pass pointers to some data to Lua and, using a metatable containing member functions bindings,
conveniently create, use and garbage collect C/C++ data structures.

Lua Bender implements shorthands for both **metatables** and **user data** to support C/C++ manipulation from Lua.

- For **metatables** this API covers the redundancy of creating the table and keeping a lua_CFunction registry efficiently.  
There is also generic constructors and destructors for C/C++ data that fit the **new** and **__gc** (garbage collection) slots of the table.  
```cpp
    // Using the previously defined test_struct.
    // The LuaMetatable is the basic interface that allows different implementations and storing in collections
    // (arrays, vectors, ...).
    lua_bender::LuaMetatable* mtable = new lua_bender::LuaClassMetatable<test_struct>();
    lua_State* L = luaL_newstate();

    // Set both creation, garbage collection and some functions.
    mtable->set_function("new",  lua_bender::LuaClassMetatable<test_struct>::create_instance);
    mtable->set_function("__gc", lua_bender::LuaClassMetatable<test_struct>::destroy_instance);

    mtable->set_function("some_func_1", lua_bender_member_function(test_struct, some_func_1, void, int));
    mtable->set_function("some_func_2", lua_bender_const_member_function(test_struct, some_func_2, float);

    // Finally create the metatable for the given state.
    mtable->create_metatable(L);
```

Which allows to do in Lua

```lua
    local var = test_struct.new()
    var:some_func_1(42)
    -- Of course no need to call the __gc destructor who will be used automatically once the state is close if needed.
```

- **User data** is implemented as a pointer wrapper with control over the Lua garbage collection.  
A set of helper functions is also available to push or access data.  
It is however **mendatory** for to create new **user data** to have a corresponding metatable registered in the Lua state  
(by using Lua Bender or any other mean).
```cpp
    lua_State* L = luaL_newstate();
    // Pushing some new user data.
    test_struct* struct_a = new test_struct();
    // The required metatable mentionned above is searched in the Lua state by name.
    // For this example the API name format is used but of course any custom implementation name system will work.
    lua_bender::user_data::push(L, struct_a, lua_bender::get_luaL_type_name<test_struct>());

    /* .. Running a Lua script that returns a test_struct. */

    // Accessing the user data just returned and thus located at index 1.
    lua_bender::user_data* udata = lua_bender::user_data::check(L, 1);
    test_struct* struct_b = (test_struct*)udata->m_data;
    // If the struct_b pointer must remain valid after the script lifespan,
    // the garbage collection for this user data must be disabled.
    udata->m_garbage_collected = false;

    lua_close(L);
    // Past this point struct_a and struct_b are still valid and up to date.
```

As shown above, the **user data** wrapper is  **ALWAYS** destroyed when the lua_State is closed, but the data **is not** garbage collected by default if created from C/C++ instead of Lua, or if it is manually specifyed to the API of course.  


### **Lua library**

The **lua_library** structure is a collection of **metatables** and **lua_CFunction** organized by names.  
A very basic way to store a set of bindings and share it with differents scripts.

Some quick function wrapper are also available to run code from a file or a string.

```cpp
// Creating the library and adding some function.
lua_bender::lua_library test_lib;
test_lib.set_function("some_func", lua_bender_function(test_template<int>, int, const int&));

// Adding a metatable for the previously defined test_struct.
std::shared_ptr<LuaMetatable> metatable = std::make_shared<LuaClassMetatable<test_struct>>();
// ... Add some functions to the metatable ...
test_lib.set_metatable(get_luaL_type_name<test_struct>().c_str(), test_table_ptr);

// Creating the execution context.
lua_State* L  = luaL_newstate();

// Binding the libraries, should be done only once per state.
luaL_openlibs(L);
test_lib.bind(L);

// Run some code.
const char* lua_code = "print(\"THIS IS SOME LUA CODE\")";
const char* lua_file = "some/path/file.lua";
lua_bender::script::do_string(lua_code);
lua_bender::script::do_file(lua_filer);

// Close the context.
lua_close(L);
```  

### **Lua any type**

The **lua_any_t** type is a generic way to access data from a **Lua** stack.  
The main goal behind this structure is to provide an easy way to keep all kind of data returned by a script in the same collection.

This structures also allows to keep without deep copy the **user data** allocated from the lua side by simply passing the wrapped data to the caller and disabeling the garbage collection for this variable.

```lua
do
test_object = test_struct.new()
return test_object, 42, 53, "res string"
end
```

```cpp
// Create the context
lua_State* L = luaL_newstate();

// ... Bind the test_struct and run the above script ...

// Recovering the results
std::vector<lua_any_t> res;
lua_any_t::get_results(L, res);

// Close the context.
lua_close(L);

// Results are still valid past this point.
```

