from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user, UserMixin
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from sqlalchemy import create_engine, text
from sqlalchemy import event
from sqlalchemy.exc import DisconnectionError
from sqlalchemy.sql import select


app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://u506278710_SDP:Tl+R3Oo#@109.106.246.51/u506278710_SDP'
app.config['SECRET_KEY'] = 'thisisasecretkey'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# SQLAlchemy setup
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# Login manager setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# User model
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    type_user = db.Column(db.Integer, nullable=False)
    oath_github_token = db.Column(db.String(255), nullable=True)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Login endpoint
@app.route('/api/login', methods=['POST'])
def login_api():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()

    if user and bcrypt.check_password_hash(user.password, data['password']):
        login_user(user)
        return jsonify({'message': 'Login successful', 'username': user.username, 'id': user.id}), 200

    return jsonify({'error': 'Invalid username or password'}), 401

# Registration endpoint
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(username=data['username'], email=data['email'], password=hashed_password, type_user=1)

    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

# Logout endpoint
@app.route('/api/logout', methods=['POST'])
@login_required
def logout_api():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

# For non-ORM operations, use the engine directly
engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'], pool_pre_ping=True)



""" @app.before_first_request
def setup_reconnect_listener():
    @event.listens_for(engine, "engine_connect")
    def ping_connection(connection, branch):
        if branch:
            # "branch" is a connection within a transaction, no need to check it
            return
        try:
            # try to execute a small query
            connection.scalar(select(1))
        except DisconnectionError:
            # the connection is not valid, reconnect
            connection.scalar(select(1)) """

#notes

@app.route('/api/notes', methods=['GET'])
@login_required
def get_notes():
    global engine 
    user_id = current_user.id
    query = f"""
    SELECT n.last_edit AS last_edit, n.id AS id, n.type_category AS category, n.title AS title, 
    n.content AS content, n.type_status AS type_status
    FROM note n 
    INNER JOIN user_note un ON n.id = un.REF_ID_note
    INNER JOIN user u ON u.id = un.REF_ID_user
    WHERE u.id = {user_id} AND n.deleted = 0
    """ 
    if not engine : engine = create_engine()
    result = engine.execute(query) 


    notes = [dict(row) for row in result]
    return jsonify(notes)


@app.route('/api/notes', methods=['POST'])
@login_required
def create_note():
    global engine 
    data = request.get_json()
    content = data.get('content')
    title = data.get('title') or content[:20] or content
    type_category = data['category'] or 0
    user_id = current_user.id  # Assuming this is set when the user logs in

    query_note = f"""
    INSERT INTO note (title, content, type_category)
    VALUES ('{title}', '{content}', '{type_category}')
    """ 
    if not engine : engine = create_engine()
    result_note = engine.execute(query_note)
    id_note = result_note.lastrowid


    query_user_note = f"""
    INSERT INTO user_note (REF_ID_user, REF_ID_note)
    VALUES ('{user_id}', '{id_note}')
    """
    if not engine : engine = create_engine()
    engine.execute(query_user_note)

    return jsonify({'message': 'Note created successfully'}), 201


@app.route('/api/notes/<int:note_id>', methods=['PUT'])
@login_required
def update_note(note_id):
    global engine 
    data = request.get_json()
    content = data.get('content') if (data.get('content') is not None) else ''
    title = data.get('title') if (data.get('title') is not None) else content[:20] if len(content)>20 else content
    type_category = data.get('category') or 0
    type_status = data.get('type_status') if (data.get('type_status') is not None) else 1
    """ status = data.get('completed')  """

    query = f"""
    UPDATE note
    SET title = '{title}', content = '{content}', type_category = '{type_category}', type_status = {type_status}
    WHERE id = {note_id} 
    """
    if not engine : engine = create_engine()
    engine.execute(query)


    return jsonify({'message': 'Note updated successfully'}), 200



@app.route('/api/notes/<int:note_id>', methods=['PUT'])
@login_required
def deactivate_note(note_id):
    global engine  

    query = f"""
    UPDATE note
    SET delete = '1'
    WHERE id = {note_id} 
    """
    if not engine : engine = create_engine()
    engine.execute(query)


    return jsonify({'message': 'Note deleted successfully'}), 200




@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
@login_required
def delete_note(note_id):
    global engine 
    current_user_id = current_user.id 

    query1 = f"DELETE FROM user_note WHERE REF_ID_note = {note_id} AND REF_ID_user = {current_user_id}"
    if not engine : engine = create_engine()
    engine.execute(query1)

    query2 = f"DELETE FROM note WHERE id = {note_id}"
    if not engine : engine = create_engine()
    engine.execute(query2)


    return jsonify({'message': 'Note deleted successfully'}), 200



#categories
@app.route('/api/categories', methods=['GET'])
@login_required
def category_exists_user_color():
    global engine 
    data = request.get_json()
    category = data['category'] 
    color = data['color']
    user_id = current_user.id  # Assuming this is set when the user logs in

    #query to see if user already has the category related to him
    query_get = f"""
    SELECT tc.name AS category, tc.id, AS type_category FROM category c  
    INNER JOIN user_category un ON c.id = un.REF_ID_category
    INNER JOIN user u ON u.id = un.REF_ID_user
    WHERE u.id = {user_id} AND c.name = {category} and c.color = {color}
    """ 
    if not engine : engine = create_engine()
    result_get = engine.execute(query_get)
    return jsonify(True if result_get else False)

@app.route('/api/categories', methods=['GET'])
@login_required
def get_categories():
    global engine 
    user_id = current_user.id
    query = f"""
    SELECT tc.name AS category, tc.id, AS type_category FROM category c 
    INNER JOIN user_note un ON c.id = un.REF_ID_note
    INNER JOIN user u ON u.id = un.REF_ID_user
    WHERE u.id = {user_id} 
    """ 
    if not engine : engine = create_engine()
    result = engine.execute(query)


    categories = [dict(row) for row in result]
    return jsonify(categories)


@app.route('/api/categories', methods=['POST'])
@login_required
def create_category():
    global engine 
    data = request.get_json()
    type_category = data['category'] 
    color = data['color'] or None
    user_id = current_user.id  # Assuming this is set when the user logs in

    query_note = f"""
    INSERT INTO category (name, color)
    VALUES ('{type_category}', '{color}')
    """ 
    if not engine : engine = create_engine()
    result_note = engine.execute(query_note)
    id_category = result_note.lastrowid


    query_user_note = f"""
    INSERT INTO user_category (REF_ID_user, REF_ID_category)
    VALUES ('{user_id}', '{id_category}')
    """
    if not engine : engine = create_engine()
    result_user_note = engine.execute(query_user_note)

    return jsonify({'message': 'Category created successfully'}), 201


@app.route('/api/categories/<int:category_id>', methods=['PUT'])
@login_required
def update_category(category_id=0):
    global engine 
    data = request.get_json()  
    category = data.get('category') or None
    color = data.get('color') or None

    query = f"""
    UPDATE category
    SET name = '{category}', color = '{color}'
    WHERE id = {category_id} 
    """
    if not engine : engine = create_engine()
    engine.execute(query)


    return jsonify({'message': 'Category updated successfully'}), 200



@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
@login_required
def delete_category(category_id):
    global engine  

    query = f"DELETE FROM category WHERE id = {category_id}"
    if not engine : engine = create_engine()
    engine.execute(query)


    return jsonify({'message': 'Category deleted successfully'}), 200


@app.teardown_appcontext
def shutdown_session(exception=None):
    db.session.remove()

if __name__ == "__main__":
    app.run(debug=True)

