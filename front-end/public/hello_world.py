tc = tp.task_context(5)

x = tc.create_expression('x', 'state', (1, 1))

u = tc.create_expression('u', 'control', (1, 1))

tc.set_dynamics(x, u)

task_spec = {'initial_constraints':[{'expression':x, 'reference':0}]}
task_spec['path_constraints'] = [{'expression':u, 'reference':0, 'hard':False, 'gain':1}]
task_spec['final_constraints'] = [{'expression':x, 'reference':1, 'hard':True}]

tc.add_task_constraint(task_spec)

tc.set_ocp_solver('ipopt')
disc_settings = {'discretization method': 'single shooting', 'horizon size': 5, 'order':1, 'integration':'rk'}
tc.set_discretization_settings(disc_settings)

sol = tc.solve_ocp()

# Another example

tc = tp.task_context(5)

x = tc.create_expression('x', 'state', (1, 1))

u = tc.create_expression('u', 'control', (1, 1))

tc.set_dynamics(x, u)

task_spec = {'initial_constraints':[{'expression':x, 'reference':0}]}
task_spec['path_constraints'] = [{'expression':u, 'reference':0, 'hard':False, 'gain':1}]
task_spec['final_constraints'] = [{'expression':x, 'reference':1, 'hard':True}]

tc.add_task_constraint(task_spec)

tc.set_ocp_solver('ipopt')
disc_settings = {'discretization method': 'single shooting', 'horizon size': 5, 'order':1, 'integration':'rk'}
tc.set_discretization_settings(disc_settings)


sol = tc.solve_ocp()


# Another example

tc = tp.task_context(5)

x = tc.create_expression('x', 'state', (1, 1))

u = tc.create_expression('u', 'control', (1, 1))

tc.set_dynamics(x, u)

task_spec = {'initial_constraints':[{'expression':x, 'reference':0}]}
task_spec['path_constraints'] = [{'expression':u, 'reference':0, 'hard':False, 'gain':1}]
task_spec['final_constraints'] = [{'expression':x, 'reference':1, 'hard':True}]

tc.add_task_constraint(task_spec)

tc.set_ocp_solver('ipopt')
disc_settings = {'discretization method': 'single shooting', 'horizon size': 5, 'order':1, 'integration':'rk'}
tc.set_discretization_settings(disc_settings)


sol = tc.solve_ocp()

